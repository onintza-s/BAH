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
import json  # <-- NEW

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

# 1. Setup Model
model_path = hf_hub_download(repo_id="pauhidalgoo/yolov8-DIOR", filename="DIOR_yolov8n_backbone.pt")
detection_model = AutoDetectionModel.from_pretrained(
    model_type='yolov8', model_path=model_path, confidence_threshold=0.4, device="cpu"
)

# EVALUATION BLOCK.

# 2. Setup Data
folder = "raw_tifs"
files = sorted(glob.glob(os.path.join(folder, "*.tif")))[:15]  # <-- 15 файлов
print("Используем файлы:")
for f in files:
    print("  ", os.path.basename(f))

geo_detections = []

# Create a storage for the raw results
inference_cache = {}
source_crs = None  # <-- NEW: будем хранить CRS

# 3. Process Loop (Inference Only)
print(f"Starting inference on {len(files)} images...")

start_time = time.time()

for path in tqdm(files, desc="Detecting"):
    # Open and Read
    src = rasterio.open(path)
    if source_crs is None:
        source_crs = src.crs  # <-- запоминаем CRS сцены

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

# =========================
# 4. Export detections to JSON for frontend
# =========================

if source_crs is None:
    raise RuntimeError("No CRS detected, did you have any valid images?")

# переводим все боксы в EPSG:4326 (lon/lat)
gdf = gpd.GeoDataFrame(geo_detections, crs=source_crs).to_crs(epsg=4326)

detections_for_json = []
for _, row in gdf.iterrows():
    minx, miny, maxx, maxy = row.geometry.bounds
    centroid = row.geometry.centroid

    detections_for_json.append({
        "file": row["file"],
        "label": row["label"],
        "score": row["score"],
        "bbox": {
            "min_lon": minx,
            "min_lat": miny,
            "max_lon": maxx,
            "max_lat": maxy,
        },
        "center": {
            "lon": centroid.x,
            "lat": centroid.y,
        },
    })

output_json = "detections_15_tiles.json"
with open(output_json, "w", encoding="utf-8") as f:
    json.dump(detections_for_json, f, ensure_ascii=False, indent=2)

print(f"Saved JSON to {output_json}")

FRONT_DET_DIR = Path(__file__).resolve().parents[1] / "front" / "public" / "detections"
FRONT_DET_DIR.mkdir(parents=True, exist_ok=True)

front_output_path = FRONT_DET_DIR / "detections_15_tiles.json"

with open(front_output_path, "w", encoding="utf-8") as f:
    json.dump(detections_for_json, f, ensure_ascii=False, indent=2)

print(f"[FRONT] Saved detections to {front_output_path}")
