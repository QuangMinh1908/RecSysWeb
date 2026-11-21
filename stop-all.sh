#!/bin/bash
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== ?ang d?ng c?c d?ch v? c?a Demo-Web ==="
pkill -f 'core-backend' 2>/dev/null && echo "  [OK] Backend stopped." || echo "  [--] Backend not running."
pkill -f 'vite' 2>/dev/null && echo "  [OK] Frontend stopped." || echo "  [--] Frontend not running."
"$PROJECT_DIR/3-model-service/stop_model.sh" 2>/dev/null && echo "  [OK] Model stopped." || echo "  [--] Model not running."
echo "=== Ho?n t?t d?ng d?ch v?! ==="
