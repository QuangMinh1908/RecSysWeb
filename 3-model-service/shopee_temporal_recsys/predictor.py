import os
import math
import numpy as np
import torch
from typing import List, Dict, Any, Optional, Tuple
from .schemas import (
    ProductSnapshot, ProductStaticInfo, UserProfile,
    PredictionRequest, PredictionResponse
)
from .model import MultiStreamFusionRecSysModel

CATEGORIES = ["ao_thun_nam", "chuot_khong_day", "sua", "tai_nghe_khong_day"]
CAT_TO_IDX = {cat: i for i, cat in enumerate(CATEGORIES)}

class ShopeeTemporalRecSysPredictor:
    """
    High-Performance Production Predictor for Temporal RecSys (M4_GRU / B2_Latest).
    Handles tensor batching, dynamic padding, scaling, and real-time inference.
    """
    def __init__(
        self,
        model_path: Optional[str] = None,
        compressor_name: str = "M4_GRU",
        device: Optional[str] = None
    ):
        if device is None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)

        self.model = MultiStreamFusionRecSysModel(
            compressor_name=compressor_name
        ).to(self.device)

        if model_path and os.path.exists(model_path):
            state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
            self.model.load_state_dict(state_dict)
            print(f"[ShopeePredictor] Successfully loaded weights from {model_path} onto {self.device}")
        else:
            print(f"[ShopeePredictor] Initialized model with default architecture on {self.device}")

        self.model.eval()

    def _normalize_features(
        self,
        s_item: ProductStaticInfo,
        snaps: List[ProductSnapshot]
    ) -> Tuple[np.ndarray, str, Dict[str, Any]]:
        # Fallback if no snapshots: create pseudo-snapshot
        if not snaps:
            snaps = [ProductSnapshot(
                snapshot_date="2026-11-20",
                price=s_item.original_price,
                discount_rate=0.0,
                rating_average=4.5,
                review_count=0,
                sold_count=0.0
            )]

        # Features per snapshot:
        # [0: norm_price, 1: discount, 2: rating, 3: log_reviews, 4: log_sold, 5: price_delta_ratio]
        feature_rows = []
        prices = [s.price for s in snaps]
        min_p, max_p = min(prices), max(prices)
        vol_pct = (max_p - min_p) / (max_p + 1e-6)

        if vol_pct > 0.15:
            vol_tier = "High"
        elif vol_pct > 0.05:
            vol_tier = "Medium"
        else:
            vol_tier = "Low"

        first_p = snaps[0].price
        for s in snaps:
            norm_price = s.price / 1_000_000.0
            norm_discount = s.discount_rate / 100.0
            norm_rating = s.rating_average / 5.0
            norm_reviews = math.log1p(s.review_count) / 8.0
            norm_sold = math.log1p(s.sold_count) / 10.0
            price_delta = (s.price - first_p) / (first_p + 1e-6)

            feature_rows.append([
                norm_price, norm_discount, norm_rating,
                norm_reviews, norm_sold, price_delta
            ])

        latest_snap = snaps[-1]
        signals = {
            "price_trend": "Giảm sâu" if (latest_snap.price < first_p * 0.85) else ("Tăng giá" if latest_snap.price > first_p * 1.1 else "Ổn định"),
            "latest_price_vnd": latest_snap.price,
            "original_price_vnd": s_item.original_price,
            "discount_pct": latest_snap.discount_rate,
            "volatility_percentage": round(vol_pct * 100, 2)
        }
        return np.array(feature_rows, dtype=np.float32), vol_tier, signals

    @torch.no_grad()
    def predict_one(self, req: PredictionRequest, threshold: float = 0.5) -> PredictionResponse:
        u = req.user
        s = req.product_static
        feats, vol_tier, signals = self._normalize_features(s, req.snapshots_history)

        L = len(feats)
        # 1. Batch User
        u_id = torch.tensor([u.user_id % 10001], dtype=torch.long, device=self.device)
        p_id = torch.tensor([u.persona_id % 5], dtype=torch.long, device=self.device)
        cat_p = torch.zeros(1, 4, dtype=torch.float32, device=self.device)
        c_idx = CAT_TO_IDX.get(u.preferred_category, 0)
        cat_p[0, c_idx] = 1.0
        batch_user = {"user_id": u_id, "persona_id": p_id, "category_pref": cat_p}

        # 2. Batch Static
        c_item_idx = torch.tensor([CAT_TO_IDX.get(s.category, 0)], dtype=torch.long, device=self.device)
        b_idx = torch.tensor([s.brand_id % 1000], dtype=torch.long, device=self.device)
        sel_idx = torch.tensor([s.seller_id % 1000], dtype=torch.long, device=self.device)
        orig_p = torch.tensor([[s.original_price / 1_000_000.0]], dtype=torch.float32, device=self.device)
        batch_static = {
            "category_id": c_item_idx,
            "brand_id": b_idx,
            "seller_id": sel_idx,
            "original_price_norm": orig_p
        }

        # 3. Batch Dynamic
        hist_t = torch.tensor(feats, dtype=torch.float32, device=self.device).unsqueeze(0) # [1, L, 6]
        seq_lens = torch.tensor([L], dtype=torch.long, device=self.device)
        batch_dynamic = {
            "hist_dense": hist_t,
            "seq_lens": seq_lens
        }

        # Inference
        logit = self.model(batch_user, batch_static, batch_dynamic)
        p_click = float(torch.sigmoid(logit).item())

        return PredictionResponse(
            item_id=s.item_id,
            p_click=round(p_click, 4),
            decision="CLICK" if p_click >= threshold else "PASS",
            threshold=threshold,
            model_version=f"ShopeeTemporal-{self.model.compressor_name}-v1.0",
            num_snapshots_used=L,
            price_volatility_tier=vol_tier,
            temporal_signals=signals
        )

    @torch.no_grad()
    def predict_batch(
        self,
        user: UserProfile,
        candidates: List[Tuple[ProductStaticInfo, List[ProductSnapshot]]],
        threshold: float = 0.5
    ) -> List[PredictionResponse]:
        """Scoring and Ranking Feed of N candidate items for a single user."""
        results = []
        for s_item, snaps in candidates:
            req = PredictionRequest(user=user, product_static=s_item, snapshots_history=snaps)
            res = self.predict_one(req, threshold=threshold)
            results.append(res)
        results.sort(key=lambda x: x.p_click, reverse=True)
        return results
