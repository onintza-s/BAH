# Standard Library Imports
import base64
import glob
import hashlib
import logging
import os
from pathlib import Path
import io
import time
from concurrent.futures import ThreadPoolExecutor
import json

# Data & Image Processing Imports
import matplotlib.pyplot as plt
import numpy as np
import psutil
from PIL import Image
from tqdm.auto import tqdm

# Geospatial Imports
import folium
import geopandas as gpd
import rasterio
from rasterio.warp import reproject, Resampling, calculate_default_transform
from rasterio.transform import array_bounds
# from osgeo import gdal # GDAL was not working so is removed.
from shapely.geometry import box

# Machine Learning & Cloud Imports
import boto3
import torch
from botocore import UNSIGNED
from botocore.config import Config
from huggingface_hub import hf_hub_download
from sahi import AutoDetectionModel
from sahi.predict import get_sliced_prediction
from sahi.utils.cv import visualize_object_predictions

torch.set_num_threads(16)        # сколько потоков внутри операторов (conv, matmul)
torch.set_num_interop_threads(1) # сколько потоков для параллельных операторов

print("PyTorch threads:", torch.get_num_threads())

# 1. Setup Model
# Hugging face
model_path = hf_hub_download(repo_id="pauhidalgoo/yolov8-DIOR", filename="DIOR_yolov8n_backbone.pt")
detection_model = AutoDetectionModel.from_pretrained(
    model_type='yolov8', model_path=model_path, confidence_threshold=0.4, device="cpu"
)



# EVALUATION BLOCK.

# 2. Setup Data
folder = "raw_tifs"
files = sorted(glob.glob(os.path.join(folder, "*.tif")))[:100]
geo_detections = []

# Create a storage for the raw results
inference_cache = {}

# 3. Process Loop (Inference Only)
print(f"Starting inference on {len(files)} images...")

# --- ADDITION: Start Timer ---
start_time = time.time()

for path in tqdm(files, desc="Detecting"):
    # Open and Read
    src = rasterio.open(path)
    img = src.read([1, 2, 3]).transpose(1, 2, 0)
    transform = src.transform

    # Normalize
    p2, p98 = np.percentile(img, (2, 98))
    img = np.clip((img - p2) / (p98 - p2) * 255.0, 0, 255).astype(np.uint8)
    img_contiguous = np.ascontiguousarray(img)

    # Predict
    result = get_sliced_prediction(
        Image.fromarray(img_contiguous), detection_model,
        slice_height=512, slice_width=512, overlap_height_ratio=0.1, verbose=0
    )

    inference_cache[path] = result

    # Georeference results
    for det in result.object_prediction_list:
        x1, y1 = transform * (det.bbox.minx, det.bbox.miny)
        x2, y2 = transform * (det.bbox.maxx, det.bbox.maxy)

        geo_detections.append({
            'geometry': box(min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2)),
            'label': det.category.name,
            'score': round(det.score.value, 2),
            'file': os.path.basename(path)
        })

    src.close()

end_time = time.time()
total_inference_time = end_time - start_time

print(f"Done! Saved {len(geo_detections)} detections.")
print(f"Total inference time to be submitted to evaluators: {total_inference_time:.2f} seconds")

# === Single tile interactive map ===
# Берем один файл (первый)
# === Multi-tile interactive map ===

# Сколько тайлов показывать (можешь увеличить, если ок по производительности)
subset_paths = files[:1]

# Берём первый файл, чтобы задать центр карты
with rasterio.open(subset_paths[0]) as src0:
    source_crs = src0.crs
    dst_crs = 'EPSG:4326'
    transform0, width0, height0 = calculate_default_transform(
        src0.crs, dst_crs, src0.width, src0.height, *src0.bounds
    )
    left0, bottom0, right0, top0 = array_bounds(height0, width0, transform0)
    center = [(bottom0 + top0) / 2, (left0 + right0) / 2]

m = folium.Map(location=center, zoom_start=16, tiles='Esri.WorldImagery')

for i, tiff_path in enumerate(subset_paths):
    with rasterio.open(tiff_path) as src:
        nodata_val = src.nodata if src.nodata is not None else 0

        dst_crs = 'EPSG:4326'
        transform, width, height = calculate_default_transform(
            src.crs, dst_crs, src.width, src.height, *src.bounds
        )

        destination = np.zeros((src.count, height, width), dtype=src.dtypes[0])

        reproject(
            source=rasterio.band(src, range(1, src.count + 1)),
            destination=destination,
            dst_transform=transform,
            dst_crs=dst_crs,
            dst_nodata=nodata_val,
            resampling=Resampling.bilinear
        )

        img_data = np.moveaxis(destination, 0, -1)

        # Простейшее растяжение контраста (как у тебя)
        scaled_data = (img_data.astype(np.float32) - 23) * 255.0 / (150 - 23)
        scaled_data = np.clip(scaled_data, 0, 255).astype(np.uint8)

        # Маска по nodata
        mask = (destination[0] == nodata_val)
        alpha = np.where(mask, 0, 255).astype(np.uint8)

        if scaled_data.shape[2] == 1:
            rgb_data = np.dstack((scaled_data, scaled_data, scaled_data))
        else:
            rgb_data = scaled_data[..., :3]

        rgba_data = np.dstack((rgb_data, alpha))
        img = Image.fromarray(rgba_data, 'RGBA')

        buffer = io.BytesIO()
        img.save(buffer, format='PNG')

        b_left, b_bottom, b_right, b_top = array_bounds(height, width, transform)
        bounds = [[b_bottom, b_left], [b_top, b_right]]

        encoded = base64.b64encode(buffer.getvalue()).decode('utf-8')

        folium.raster_layers.ImageOverlay(
            image=f"data:image/png;base64,{encoded}",
            bounds=bounds,
            name=f"Tile {i}: {os.path.basename(tiff_path)}",
            opacity=0.9,
        ).add_to(m)

# --- Детекции только по выбранным тайлам ---
subset_files = {os.path.basename(p) for p in subset_paths}

gdf = gpd.GeoDataFrame(
    [d for d in geo_detections if d['file'] in subset_files],
    crs=source_crs
).to_crs(epsg=4326)

def get_color(label):
    return '#' + hashlib.md5(str(label).encode()).hexdigest()[:6]

folium.GeoJson(
    gdf,
    name="Detections",
    style_function=lambda x: {
        'color': get_color(x['properties']['label']),
        'weight': 2,
        'fillOpacity': 0.2,
        'fillColor': get_color(x['properties']['label'])
    },
    tooltip=folium.GeoJsonTooltip(
        fields=['label', 'score', 'file'],
        aliases=['Object:', 'Confidence:', 'File:'],
        localize=True
    )
).add_to(m)

folium.LayerControl().add_to(m)

labels = {d['label'] for d in geo_detections}
print(labels)

m.save("multi_image_with_detections.html")
print("Saved map to multi_image_with_detections.html")

summary = {
    "num_images": len(files),
    "num_detections": len(geo_detections),
    "total_seconds": total_inference_time,
    "avg_seconds_per_image": total_inference_time / len(files) if files else None
}

with open("../front/public/metrics.json", "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2)
