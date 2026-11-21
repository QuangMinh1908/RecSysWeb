import os, sys
# Ensure parent directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import os
from shopee_temporal_recsys import (
    ShopeeTemporalRecSysPredictor,
    UserProfile,
    ProductStaticInfo,
    ProductSnapshot,
    PredictionRequest
)

def run_demo():
    print("=== KHỞI TẠO SHOPEE TEMPORAL RECSYS PREDICTOR ===")
    current_dir = os.path.dirname(__file__)
    weight_path = os.path.join(current_dir, "weights_m4_gru.pt")
    
    predictor = ShopeeTemporalRecSysPredictor(
        model_path=weight_path if os.path.exists(weight_path) else None,
        compressor_name="M4_GRU"
    )

    # Khởi tạo User
    user = UserProfile(
        user_id=1042,
        persona_id=0, # Deal Hunter (Săn sale)
        preferred_category="ao_thun_nam"
    )

    # Khởi tạo Sản phẩm có biến động giá sâu (Flash Sale)
    product = ProductStaticInfo(
        item_id=158941031,
        name="Áo thun nam Cotton Compact co giãn 4 chiều",
        category="ao_thun_nam",
        brand_id=12,
        seller_id=45,
        original_price=150000.0
    )

    # Chuỗi lịch sử giá & doanh số
    snapshots = [
        ProductSnapshot(snapshot_date="2026-11-01", price=150000.0, discount_rate=0.0, rating_average=4.8, review_count=320, sold_count=1200.0),
        ProductSnapshot(snapshot_date="2026-11-05", price=135000.0, discount_rate=10.0, rating_average=4.8, review_count=350, sold_count=1310.0),
        ProductSnapshot(snapshot_date="2026-11-10", price=120000.0, discount_rate=20.0, rating_average=4.9, review_count=410, sold_count=1500.0),
        ProductSnapshot(snapshot_date="2026-11-11", price=89000.0, discount_rate=40.0, rating_average=4.9, review_count=480, sold_count=1950.0),
    ]

    req = PredictionRequest(user=user, product_static=product, snapshots_history=snapshots)
    res = predictor.predict_one(req)
    
    print("\n[DỰ ĐOÁN THÀNH CÔNG]:")
    print(f"- Item ID: {res.item_id}")
    print(f"- Xác suất Click P(Click): {res.p_click:.4f}")
    print(f"- Quyết định phục vụ: {res.decision}")
    print(f"- Phân tầng biến động giá: {res.price_volatility_tier}")
    print(f"- Tín hiệu thị trường: {res.temporal_signals}")

if __name__ == "__main__":
    run_demo()
