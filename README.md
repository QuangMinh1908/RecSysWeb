## Yêu cầu
Docker (hoặc PostgreSQL 14+), JDK 21, Maven 3.9+, Node 18+.

## Chạy dự án

```bash
# 1) Database (tự tạo schema + user demo + 12 sản phẩm mẫu)
docker compose up -d

# 2) Backend  → http://localhost:8080
cd 2-core-backend
mvn spring-boot:run

# 3) Frontend → http://localhost:5173
cd 1-frontend-web
npm install
npm run dev
```

Không dùng Docker: tạo database `ecommerce_recsys` rồi chạy lần lượt
`database/init/01_schema.sql` và `02_seed.sql` bằng pgAdmin/DBeaver/psql.
Đổi tài khoản DB bằng biến môi trường `DB_USERNAME`, `DB_PASSWORD`.

## Nạp dữ liệu Shopee
Xem hướng dẫn trong `database/import_shopee.sql` (CSV: name, price, original_price, image_url, description).

## Kiểm tra nhanh API

```bash
curl "http://localhost:8080/api/v1/search?keyword=tai%20nghe&userId=1"

curl -X POST http://localhost:8080/api/v1/interactions \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productId":2,"type":"CLICK"}'

# Xem log hành vi
docker exec -it ecommerce-recsys-db psql -U postgres -d ecommerce_recsys \
  -c "SELECT * FROM user_interactions ORDER BY id DESC LIMIT 5;"
```

## Ghi chú
- Frontend đang dùng user demo `id = 1` (hằng `DEMO_USER_ID` trong `src/services/api.js`).
- `ProductService.search()` là logic tạm (ILIKE, tối đa 10 kết quả). Khi tích hợp RecSys chỉ cần thay thân hàm này, Controller và Frontend giữ nguyên.
- `ddl-auto: update` chỉ phù hợp lúc phát triển.
- Tìm kiếm hiện phân biệt dấu tiếng Việt ("ao" không khớp "áo"); cách xử lý bằng `unaccent` có ghi ở cuối `import_shopee.sql`.
