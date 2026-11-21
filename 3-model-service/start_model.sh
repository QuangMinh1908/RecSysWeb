#!/bin/bash
# start.sh — Khởi động Shopee Temporal RecSys Model Service
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source ~/miniconda3/etc/profile.d/conda.sh
conda activate recsys

echo "[Model Service] Starting on port 8000..."
cd "$SCRIPT_DIR"
uvicorn shopee_temporal_recsys.api_service:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 2 \
    --log-level info