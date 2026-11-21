#!/bin/bash
# start-all.sh ? Kh?i ??ng t?t c? c?c d?ch v? c?a Demo-Web
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo "      Kh?i ??ng H? th?ng Shopee Temporal RecSys Web       "
echo "=========================================================="

# 1. Start AI Model Service (Port 8000)
echo "[1/3] Kh?i ??ng AI Model Service (:8000)..."
cd "$PROJECT_DIR/3-model-service"
nohup ./start_model.sh > "$PROJECT_DIR/model.log" 2>&1 &

# 2. Start Core Backend (Port 8080)
echo "[2/3] Kh?i ??ng Core Backend (:8080)..."
nohup java -jar "$PROJECT_DIR/2-core-backend/target/core-backend-0.0.1-SNAPSHOT.jar" \
    --spring.config.location="$PROJECT_DIR/2-core-backend/src/main/resources/application.yml" \
    > "$PROJECT_DIR/backend.log" 2>&1 &

# 3. Start Frontend Web (Port 5173)
echo "[3/3] Kh?i ??ng Frontend Web (:5173)..."
cd "$PROJECT_DIR/1-frontend-web"
nohup npm run dev -- --host 0.0.0.0 --port 5173 > "$PROJECT_DIR/frontend.log" 2>&1 &

echo "=========================================================="
echo "  T?t c? d?ch v? ?? ???c kh?i ??ng n?n:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend:  http://localhost:8080"
echo "  - Model:    http://localhost:8000"
echo "=========================================================="
