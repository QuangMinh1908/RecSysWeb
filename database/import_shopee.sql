-- =====================================================================
-- Nạp dữ liệu Shopee từ file CSV vào bảng products.
-- Chạy bằng psql (DBeaver/pgAdmin dùng tính năng Import CSV có sẵn):
--
--   psql -U postgres -d ecommerce_recsys -f database/import_shopee.sql
--
-- Đặt file CSV cạnh file này, tên: shopee_products.csv, mã hoá UTF-8,
-- dòng đầu là tiêu đề cột: name,price,original_price,image_url,description
-- =====================================================================

-- 1) Xoá dữ liệu mẫu (bỏ comment nếu muốn). Lưu ý: xoá luôn log tương tác.
-- TRUNCATE products RESTART IDENTITY CASCADE;

-- 2) Nạp CSV (id tự sinh)
\copy products (name, price, original_price, image_url, description) FROM 'database/shopee_products.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- Nếu CSV đã có sẵn cột id, dùng dòng dưới thay cho dòng trên:
-- \copy products (id, name, price, original_price, image_url, description) FROM 'database/shopee_products.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 3) Đồng bộ lại bộ đếm id sau khi nạp
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));

-- 4) Kiểm tra
SELECT count(*) AS total_products FROM products;

-- (Tuỳ chọn) Tìm kiếm không phân biệt dấu tiếng Việt:
-- CREATE EXTENSION IF NOT EXISTS unaccent;
-- rồi đổi truy vấn thành: unaccent(name) ILIKE unaccent('%' || :keyword || '%')
