from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ProductSnapshot(BaseModel):
    snapshot_date: str = Field(..., description="Ngày ghi nhận (YYYY-MM-DD)")
    price: float = Field(..., description="Giá bán tại thời điểm snapshot (VND)")
    discount_rate: float = Field(0.0, description="Tỷ lệ giảm giá (%)")
    rating_average: float = Field(4.5, description="Điểm đánh giá trung bình (1-5)")
    review_count: int = Field(0, description="Số lượng lượt đánh giá")
    sold_count: float = Field(0.0, description="Tổng số lượng đã bán luỹ kế")

class ProductStaticInfo(BaseModel):
    item_id: int = Field(..., description="ID sản phẩm")
    name: str = Field("Sản phẩm Shopee", description="Tên sản phẩm")
    category: str = Field("ao_thun_nam", description="Tên ngành hàng (ao_thun_nam, chuot_khong_day, sua, tai_nghe_khong_day)")
    brand_id: int = Field(0, description="Mã định danh thương hiệu (0 nếu không rõ)")
    seller_id: int = Field(0, description="Mã định danh nhà bán hàng (0 nếu không rõ)")
    original_price: float = Field(..., description="Giá niêm yết ban đầu (VND)")

class UserProfile(BaseModel):
    user_id: int = Field(..., description="ID người dùng (1 - 10000)")
    persona_id: int = Field(0, description="Mã nhóm tính cách (0: Deal Hunter, 1: Trend Chaser, 2: Quality Seeker, 3: Frugal, 4: Brand Loyalist)")
    preferred_category: str = Field("ao_thun_nam", description="Ngành hàng yêu thích")

class PredictionRequest(BaseModel):
    user: UserProfile
    product_static: ProductStaticInfo
    snapshots_history: List[ProductSnapshot] = Field(default_factory=list, description="Chuỗi lịch sử các snapshots quá khứ xếp theo thời gian tăng dần")

class PredictionResponse(BaseModel):
    item_id: int
    p_click: float = Field(..., description="Xác suất người dùng nhấp chuột (0.0 - 1.0)")
    decision: str = Field(..., description="'CLICK' nếu p_click >= threshold, ngược lại 'PASS'")
    threshold: float
    model_version: str
    num_snapshots_used: int
    price_volatility_tier: str
    temporal_signals: Dict[str, Any]
