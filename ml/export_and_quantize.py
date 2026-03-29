# export_and_quantize.py

import os
import shutil
from huggingface_hub import hf_hub_download
from ultralytics import YOLO
from onnxruntime.quantization import quantize_dynamic, QuantType

MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

print("Downloading YOLOv8 DIOR .pt from HuggingFace...")
pt_path = hf_hub_download(
    repo_id="pauhidalgoo/yolov8-DIOR",
    filename="DIOR_yolov8n_backbone.pt"
)
print("Downloaded .pt to:", pt_path)

print("Exporting to ONNX...")
model = YOLO(pt_path)
onnx_export_path = model.export(
    format="onnx",
    imgsz=640,   
    opset=12
)
print("Raw ONNX exported to:", onnx_export_path)

onnx_fp32_path = os.path.join(MODELS_DIR, "dior_yolov8n.onnx")
shutil.copy2(onnx_export_path, onnx_fp32_path)
print("Copied ONNX to:", onnx_fp32_path)

onnx_int8_path = os.path.join(MODELS_DIR, "dior_yolov8n_int8.onnx")
print("Quantizing to INT8...")
quantize_dynamic(
    model_input=onnx_fp32_path,
    model_output=onnx_int8_path,
    weight_type=QuantType.QInt8,
)
print("Saved INT8 model to:", onnx_int8_path)
print("DONE.")
