#!/bin/bash
# stop-all.sh - Stop all Demo-Web services
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Stopping Demo-Web services ==="

# Stop backend
if pkill -f 'core-backend-0.0.1-SNAPSHOT.jar' 2>/dev/null; then
    echo "  [OK] Backend stopped."
else
    echo "  [--] Backend not running."
fi

# Stop frontend
if pkill -f 'vite' 2>/dev/null; then
    echo "  [OK] Frontend stopped."
else
    echo "  [--] Frontend not running."
fi

# Stop model
if pkill -f 'uvicorn.*shopee_temporal_recsys' 2>/dev/null; then
    echo "  [OK] Model service stopped."
else
    echo "  [--] Model service not running."
fi

rm -f "$PROJECT_DIR"/.backend.pid "$PROJECT_DIR"/.frontend.pid "$PROJECT_DIR"/.model.pid

echo "=== All services stopped ==="
