#!/bin/bash
# status.sh - Check status of all Demo-Web services
echo "=== Checking Service Status (Ports) ==="
ss -tulpn 2>/dev/null | grep -E '5432|8080|5173|8000' || echo "No tracked ports active."

echo ""
echo "=== Process Check ==="
echo -n "Postgres (5432): "
pg_isready 2>/dev/null && echo "RUNNING" || echo "STOPPED"

echo -n "Model Service (8000): "
pgrep -f 'uvicorn.*api.main' >/dev/null && echo "RUNNING" || echo "STOPPED"

echo -n "Core Backend (8080): "
pgrep -f 'core-backend-0.0.1-SNAPSHOT.jar' >/dev/null && echo "RUNNING" || echo "STOPPED"

echo -n "Frontend Web (5173): "
pgrep -f 'vite' >/dev/null && echo "RUNNING" || echo "STOPPED"
