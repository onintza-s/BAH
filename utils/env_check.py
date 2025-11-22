# Standard Library Imports
import sys
import logging
import os
 
# Data & Image Processing Imports
import matplotlib.pyplot as plt
import psutil

# Geospatial Imports
import folium
import rasterio

# Machine Learning & Cloud Imports
import torch

# Adjust logging to be minimal
logging.getLogger("urllib3").setLevel(logging.ERROR)

# For colab
# from google.colab import output
# output.enable_custom_widget_manager()

# Overview of the VM
print("--- Inspecting The Environment ---")

# Check python version
print("Python Version:")
print(sys.version)

# Use os to get CPU cores
cpu_cores = os.cpu_count()
print(f"CPU Cores: {cpu_cores}")

# Check for GPU
is_gpu_available = torch.cuda.is_available()
print(f"GPU Available: {is_gpu_available}")

# Print RAM and storage specs
# RAM Information
ram_info = psutil.virtual_memory()
total_ram_gb = ram_info.total / (1024**3)
print(f"Total RAM: {total_ram_gb:.2f} GB")

# Storage Information
disk_info = psutil.disk_usage('/')
total_disk_gb = disk_info.total / (1024**3)
free_disk_gb = disk_info.free / (1024**3)
print(f"Total Disk Space: {total_disk_gb:.2f} GB")
print(f"Free Disk Space: {free_disk_gb:.2f} GB")
