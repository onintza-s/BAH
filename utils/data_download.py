# Standard Library Imports
import sys
import logging
import os
from pathlib import Path
import time
from concurrent.futures import ThreadPoolExecutor

# Data & Image Processing Imports
import matplotlib.pyplot as plt
import numpy as np
import psutil
from tqdm.notebook import tqdm

# Machine Learning & Cloud Imports
import boto3
from botocore import UNSIGNED
from botocore.config import Config

# 1. Configuration
client_config = Config(signature_version=UNSIGNED, max_pool_connections=20)
s3 = boto3.client('s3', config=client_config)

BUCKET = 'spacenet-dataset'
PREFIX = 'spacenet/SN6_buildings/train/AOI_11_Rotterdam/PS-RGB/'
LOCAL_DIR = os.path.join(str(Path.home()), "rotterdam_opt")

# 2. List Files and Create Task List
print("Listing files...")
paginator = s3.get_paginator('list_objects_v2')
tasks = []

for page in paginator.paginate(Bucket=BUCKET, Prefix=PREFIX):
    if 'Contents' in page:
        for obj in page['Contents']:
            key = obj['Key']
            if key.endswith('/'): continue

            local_path = os.path.join(LOCAL_DIR, key.replace(PREFIX, ""))
            tasks.append((key, local_path))

# Print the total count here
print(f"Total files found: {len(tasks)}")

# 3. Define Download Function
def download_task(task):
    key, path = task
    # Only download if file is missing
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        s3.download_file(BUCKET, key, path)

# 4. Run Parallel Downloads
print(f"Downloading {len(tasks)} images...")
with ThreadPoolExecutor(max_workers=20) as pool:
    list(tqdm(pool.map(download_task, tasks), total=len(tasks)))

# 5. Verify and Retry Missing Files
print("Verifying files...")
missing_tasks = [t for t in tasks if not os.path.exists(t[1])]

if len(missing_tasks) > 0:
    print(f"Retrying {len(missing_tasks)} missing files...")
    # Simple sequential retry for any failures
    for task in tqdm(missing_tasks):
        download_task(task)

print(f"Verified. Total files on disk: {len([t for t in tasks if os.path.exists(t[1])])}")