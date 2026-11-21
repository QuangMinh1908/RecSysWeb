#!/bin/bash
# start-all.sh - Start all Demo-Web services
set -e
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo "      Starting Shopee Temporal RecSys Web Services        "
echo "=========================================================="

# 1. Start AI Model Service (Port 8000)
echo "[1/3] Starting AI Model Service (:8000)..."
cd "$PROJECT_DIR/3-model-service"
nohup ./start_model.sh > "$PROJECT_DIR/model.log" 2>&1 &
echo $! > "$PROJECT_DIR/.model.pid"

# 2. Start Core Backend (Port 8080)
echo "[2/3] Starting Core Backend (:8080)..."
nohup java -jar "$PROJECT_DIR/2-core-backend/target/core-backend-0.0.1-SNAPSHOT.jar" \
    --spring.config.location="$PROJECT_DIR/2-core-backend/src/main/resources/application.yml" \
    > "$PROJECT_DIR/backend.log" 2>&1 &
echo $! > "$PROJECT_DIR/.backend.pid"

# 3. Start Frontend Web (Port 5173)
echo "[3/3] Starting Frontend Web (:5173)..."
cd "$PROJECT_DIR/1-frontend-web"
nohup npm run dev -- --host 0.0.0.0 --port 5173 > "$PROJECT_DIR/frontend.log" 2>&1 &
echo $! > "$PROJECT_DIR/.frontend.pid"

echo "=========================================================="
echo "  All services started successfully in background:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend:  http://localhost:8080"
echo "  - Model:    http://localhost:8000"
echo "=========================================================="
