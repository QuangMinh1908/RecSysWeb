"""
FastAPI Microservice for Shopee Temporal RecSys Serving.
Run with: uvicorn api_service:app --host 0.0.0.0 --port 8000
"""
from fastapi import FastAPI, HTTPException
from typing import List
import os

from .schemas import PredictionRequest, PredictionResponse, UserProfile, ProductStaticInfo, ProductSnapshot
from .predictor import ShopeeTemporalRecSysPredictor

app = FastAPI(
    title="Shopee Temporal CTR RecSys Serving API",
    description="Microservice dự đoán tỷ lệ nhấp chuột (CTR) dựa trên động thái biến đổi giá & chuỗi snapshot sản phẩm Shopee.",
    version="1.0.0"
)

# Global Predictor Instance
predictor = None

@app.on_event("startup")
def load_model():
    global predictor
    weights_path = os.path.join(os.path.dirname(__file__), "weights_m4_gru.pt")
    predictor = ShopeeTemporalRecSysPredictor(
        model_path=weights_path if os.path.exists(weights_path) else None,
        compressor_name="M4_GRU"
    )
    print("[API] Model successfully loaded on startup.")

@app.get("/health")
def health_check():
    return {"status": "healthy", "model": "M4_GRU", "version": "1.0.0"}

@app.post("/predict", response_model=PredictionResponse)
def predict_single(request: PredictionRequest):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Mô hình chưa sẵn sàng.")
    return predictor.predict_one(request)
