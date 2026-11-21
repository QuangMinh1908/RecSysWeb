"""
API Service Layer for Shopee Temporal RecSys.
This module provides a decoupled HTTP API layer on top of the unmodified
shopee_temporal_recsys model package.
"""
import os
import sys
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Ensure 3-model-service directory is on Python sys.path so we can import
# the untouched shopee_temporal_recsys package
SERVICE_ROOT = Path(__file__).resolve().parent.parent
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

from shopee_temporal_recsys import (
    ShopeeTemporalRecSysPredictor,
    PredictionRequest,
    PredictionResponse,
    UserProfile,
    ProductStaticInfo,
    ProductSnapshot
)

app = FastAPI(
    title="Shopee Temporal RecSys API Service",
    description="Dedicated API Layer serving the unmodified Shopee Temporal RecSys model.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Predictor Instance loaded from untouched model package
predictor: ShopeeTemporalRecSysPredictor = None

@app.on_event("startup")
def load_model_instance():
    global predictor
    weights_path = SERVICE_ROOT / "shopee_temporal_recsys" / "weights_m4_gru.pt"
    model_file = str(weights_path) if weights_path.exists() else None
    predictor = ShopeeTemporalRecSysPredictor(
        model_path=model_file,
        compressor_name="M4_GRU"
    )
    print(f"[API Layer] Model successfully initialized with weights from: {weights_path}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "api-layer",
        "model": "M4_GRU",
        "version": "1.0.0"
    }

@app.post("/predict", response_model=PredictionResponse)
def predict_item(request: PredictionRequest):
    """
    Predict single item CTR given user profile, product static info,
    and historical price/volume snapshots.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Mô hình AI chưa sẵn sàng.")
    return predictor.predict_one(request)

@app.post("/predict_batch", response_model=List[PredictionResponse])
def predict_batch_items(requests: List[PredictionRequest]):
    """
    Batch predict multiple items for a user.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Mô hình AI chưa sẵn sàng.")
    return [predictor.predict_one(req) for req in requests]
