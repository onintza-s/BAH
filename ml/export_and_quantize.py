# export_and_quantize.py

import os
import shutil
from huggingface_hub import hf_hub_download
from ultralytics import YOLO
from onnxruntime.quantization import quantize_dynamic, QuantType

# Папка, где будем хранить ONNX-модели
MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

# 1. Скачиваем .pt с HuggingFace (тот же, что ты используешь в main.py)
print("Downloading YOLOv8 DIOR .pt from HuggingFace...")
pt_path = hf_hub_download(
    repo_id="pauhidalgoo/yolov8-DIOR",
    filename="DIOR_yolov8n_backbone.pt"
)
print("Downloaded .pt to:", pt_path)

# 2. Экспорт в ONNX через Ultralytics
print("Exporting to ONNX...")
model = YOLO(pt_path)
onnx_export_path = model.export(
    format="onnx",
    imgsz=640,   # можно менять, если нужно
    opset=12
)
print("Raw ONNX exported to:", onnx_export_path)

# 3. Копируем/переименовываем в models/dior_yolov8n.onnx
onnx_fp32_path = os.path.join(MODELS_DIR, "dior_yolov8n.onnx")
shutil.copy2(onnx_export_path, onnx_fp32_path)
print("Copied ONNX to:", onnx_fp32_path)

# 4. Квантование в INT8
onnx_int8_path = os.path.join(MODELS_DIR, "dior_yolov8n_int8.onnx")
print("Quantizing to INT8...")
quantize_dynamic(
    model_input=onnx_fp32_path,
    model_output=onnx_int8_path,
    weight_type=QuantType.QInt8,
)
print("Saved INT8 model to:", onnx_int8_path)
print("DONE.")
