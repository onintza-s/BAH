import os
import json

import numpy as np
from PIL import Image
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
from rasterio.transform import array_bounds

INPUT_FOLDER = "raw_tifs"
OUTPUT_FOLDER = "../front/public/tiles"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

tiles_metadata = []

tif_files = [f for f in os.listdir(INPUT_FOLDER) if f.endswith(".tif")]

print(f"Found {len(tif_files)} tif files in {INPUT_FOLDER}")

for fname in tif_files:
    path = os.path.join(INPUT_FOLDER, fname)
    print(f"Processing {path}...")

    with rasterio.open(path) as src:
        dst_crs = "EPSG:4326"

        transform, width, height = calculate_default_transform(
            src.crs, dst_crs, src.width, src.height, *src.bounds
        )

        destination = np.zeros((src.count, height, width), dtype=src.dtypes[0])

        reproject(
            source=rasterio.band(src, list(range(1, src.count + 1))),
            destination=destination,
            dst_transform=transform,
            dst_crs=dst_crs,
            resampling=Resampling.bilinear,
        )

        nodata = src.nodata

        if nodata is not None:
            nodata_mask = destination[0] == nodata
        else:
            nodata_mask = (
                (destination[0] == 0)
                & (destination[1] == 0)
                & (destination[2] == 0)
            )

        # RGB as floa
        rgb = destination[:3].astype(np.float32) # (3, H, W)
        rgb = np.moveaxis(rgb, 0, -1) # (H, W, 3)

        valid_pixels = rgb[~nodata_mask]

        if valid_pixels.size > 0:
            p2, p98 = np.percentile(valid_pixels, (2, 98))
            rgb = np.clip((rgb - p2) / (p98 - p2) * 255.0, 0, 255)
        else:
            rgb = np.clip(rgb, 0, 255)

        rgb_uint8 = rgb.astype(np.uint8)

        alpha = np.where(nodata_mask, 0, 255).astype(np.uint8)

        rgba = np.dstack((rgb_uint8, alpha)) # (H, W, 4)

        img = Image.fromarray(rgba, "RGBA")
        out_name = fname.replace(".tif", ".png")
        out_path = os.path.join(OUTPUT_FOLDER, out_name)
        img.save(out_path, "PNG")

        # bounds in EPSG:4326
        left, bottom, right, top = array_bounds(height, width, transform)
        bounds = [[float(bottom), float(left)], [float(top), float(right)]]

        tiles_metadata.append(
            {
                "file": out_name,
                "bounds": bounds,
            }
        )

tiles_json_path = os.path.join(OUTPUT_FOLDER, "tiles.json")
with open(tiles_json_path, "w", encoding="utf-8") as f:
    json.dump(tiles_metadata, f, indent=2)

print(f"Exported {len(tiles_metadata)} tiles to {tiles_json_path}")
