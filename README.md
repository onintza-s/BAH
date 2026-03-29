# CPU-Constrained ML Inference Optimization for Ship Detection

Optimized a YOLO-based object detection pipeline for ship detection in high-resolution satellite imagery of Rotterdam port, focusing on CPU-only environments.

The project explores how far inference latency can be reduced without significantly sacrificing detection quality.

## Highlights

- Reduced end-to-end CPU inference latency by over **7×**
- Maintained acceptable detection accuracy while optimizing for speed
- Built for large, high-resolution satellite images where naive inference is too slow
- Tested different tiling, preprocessing, and execution strategies

## Problem

Running object detection on large satellite images is computationally expensive, especially on CPUs without GPU acceleration.

A single high-resolution image of Rotterdam port contains many small ships spread across a large area. Standard YOLO inference on the full image is both slow and inaccurate for small objects.

This project investigates how to optimize inference under CPU constraints.

## Approach

The optimization process focused on several areas:

### 1. Tiled Inference
Instead of running inference on the full image, the image is split into smaller overlapping tiles.

Techniques explored:
- Tile sizes: 512, 640, 768, 1024 px
- Different overlap ratios
- Skipping low-information / nearly empty tiles

### 2. SAHI-Based Sliced Detection
Used SAHI to improve detection of small ships in large images.

Benefits:
- Better small-object recall
- More efficient processing of large satellite scenes

### 3. ONNX Runtime CPU Optimization
Exported the YOLO model to ONNX and optimized CPU inference using:

- ONNX Runtime
- OpenMP / MKL backend
- Reduced tensor copies
- More efficient preprocessing pipeline
- Batched operations where possible

### 4. Preprocessing Optimization
Significant latency reduction came from minimizing preprocessing overhead:

- Avoided repeated image conversions
- Reduced unnecessary resizing and copying
- Used faster NumPy-based operations
- Reused buffers whenever possible

## Dataset

The project uses high-resolution satellite imagery of Rotterdam port.

The goal is to detect ships in dense industrial and maritime environments.

## Tech Stack

- Python
- YOLOv8
- SAHI
- ONNX Runtime
- NumPy
- OpenCV
- Rasterio
- GeoPandas
- Folium

## Results

| Method | Relative Latency | Notes |
|--------|--------|--------|
| Baseline YOLO CPU inference | 1.0× | Full image inference |
| Optimized tiled + ONNX pipeline | >7× faster | Similar detection quality |

Main improvements came from:
- Smaller tile-based inference
- Faster ONNX Runtime execution
- Reduced preprocessing overhead
