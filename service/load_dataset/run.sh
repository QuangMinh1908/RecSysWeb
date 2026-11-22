#!/bin/bash
# =============================================================================
# Helper script to execute dataset import into PostgreSQL
# =============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Activate Conda environment if present
if [ -f "/home/ds300/miniconda3/envs/recsys/bin/python" ]; then
    PYTHON_EXEC="/home/ds300/miniconda3/envs/recsys/bin/python"
else
    PYTHON_EXEC="python3"
fi

echo "=== ĐANG CHẠY NẠP DỮ LIỆU TỪ DATASET VÀO POSTGRESQL ==="
"$PYTHON_EXEC" "$SCRIPT_DIR/import_to_db.py" "$@"
echo "=== NẠP DỮ LIỆU HOÀN TẤT ==="
