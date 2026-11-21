#!/bin/bash
# start_model.sh — Khởi động Shopee Temporal RecSys Model Service
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UVICORN_BIN="/home/ds300/miniconda3/envs/recsys/bin/uvicorn"

echo "[Model Service] Starting API Layer on port 8000 using $UVICORN_BIN..."
cd "$SCRIPT_DIR"
export PYTHONPATH="$SCRIPT_DIR:$PYTHONPATH"
exec "$UVICORN_BIN" api.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1 \
    --log-level info
