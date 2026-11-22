# Dataset Loader Service (`service/load_dataset`)

Service hỗ trợ nạp tự động toàn bộ dữ liệu từ thư mục `dataset/` (tải từ Hugging Face) vào database PostgreSQL của dự án `ecommerce_recsys`.

## 1. Cấu trúc dữ liệu đọc vào
- `dataset/image_index.csv`: Ánh xạ `(product_id, snapshot_date)` $\rightarrow$ đường dẫn ảnh thực tế.
- `dataset/keywords/`: Chứa các danh mục và file snapshot chuỗi ngày (`YYYY-MM-DD.csv`).
- `dataset/image/`: Kho ảnh sản phẩm.

## 2. Các bảng được cập nhật trong PostgreSQL (`recsys`)
1. **`keywords`**: Lưu danh mục sản phẩm (`keyword_id`, `display_name`).
2. **`items`**: Lưu thông tin sản phẩm tĩnh (`item_id`, `keyword_id`, `name`, `original_price`, `shop_name`, `image_path`, `imported_date`).
3. **`snapshots`**: Lưu chuỗi thời gian giá và hành vi (`item_id`, `snapshot_date`, `price`, `discount_rate`, `rating_average`, `review_count`, `sold_count`).
4. **`image_index`**: Lưu đường dẫn ảnh theo từng ngày.

## 3. Cách chạy nạp dữ liệu

```bash
# Cách 1: Dùng script 1 chạm
cd ~/Demo-Web/service/load_dataset
./run.sh

# Cách 2: Chạy trực tiếp bằng Python
/home/ds300/miniconda3/envs/recsys/bin/python import_to_db.py

# Tuỳ biến tham số nếu cần
/home/ds300/miniconda3/envs/recsys/bin/python import_to_db.py --db-name recsys --db-password 123456
```
