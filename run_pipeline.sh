#!/bin/bash
cd ml
source .venv/bin/activate

echo "[1] Running inference..."
python main.py

echo "[2] Exporting tiles..."
python export_tiles.py

echo "[3] Exporting detections..."
python jsoning.py

echo "[4] Done!"
