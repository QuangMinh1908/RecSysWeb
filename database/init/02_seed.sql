-- =====================================================================
-- Dữ liệu mẫu để chạy thử ngay. Khi đã có dữ liệu Shopee thật,
-- xem database/import_shopee.sql để xoá dữ liệu mẫu và nạp CSV.
-- =====================================================================

-- User demo (id = 1) — frontend dùng user này khi gửi user_id.
-- Chưa có chức năng đăng nhập nên mật khẩu chỉ là giá trị giữ chỗ.
INSERT INTO users (username, password_hash, full_name)
VALUES ('demo', '{noop}demo123', 'Người dùng demo')
ON CONFLICT (username) DO NOTHING;

-- 12 sản phẩm mẫu (chỉ chèn khi bảng products còn trống)
INSERT INTO products (name, price, original_price, image_url, description)
SELECT * FROM (VALUES
  ('Áo thun cotton unisex form rộng',            129000, 199000, 'https://placehold.co/400x400/dfe9e5/12302f/png?text=Ao+thun',    'Vải cotton 100%, thấm hút tốt, nhiều màu.'),
  ('Tai nghe Bluetooth không dây chống ồn',      349000, 590000, 'https://placehold.co/400x400/dfe9e5/12302f/png?text=Tai+nghe',   'Pin 30 giờ, kết nối Bluetooth 5.3.'),
  ('Ốp lưng iPhone 15 Pro trong suốt chống sốc', 59000,  99000,  'https://placehold.co/400x400/dfe9e5/12302f/png?text=Op+lung',    'Viền TPU dẻo, mặt lưng acrylic không ố vàng.'),
  ('Giày sneaker nam đế êm thể thao',            459000, 699000, 'https://placehold.co/400x400/dfe9e5/12302f/png?text=Giay',       'Đế cao su non, nhẹ và êm khi chạy bộ.'),
  ('Balo laptop 15.6 inch chống nước',           289000, 420000, 'https://placehold.co/400x400/dfe9e5/12302f/png?text=Balo',       'Nhiều ngăn, có cổng sạc USB bên hông.'),
  ('Sạc nhanh 20W Type-C cho iPhone',            149000, 250000, 'https://placehold.co/400x400/dfe9e5/12302f/png?text=Sac+nhanh',  'Chuẩn PD 20W, bảo vệ quá nhiệt.'),
  ('Bình giữ nhiệt inox 500ml',                  119000, 179000, 'https://placehold.co/400x400/dfe9e5/12302f/png?text=Binh+giu+nhiet', 'Giữ nóng 12 giờ, giữ lạnh 24 giờ.'),
  ('Chuột không dây yên tĩnh',                   99000,  159000, 'https://placehold.co/400x400/dfe9e5/12302f/png?text=Chuot',      'Click êm, dùng pin AA khoảng 12 tháng.'),
  ('Váy nữ dáng xòe công sở',                    235000, 350000, 'https://placehold.co/400x400/dfe9e5/12302f/png?text=Vay',        'Chất liệu co giãn nhẹ, ít nhăn.'),
  ('Đèn bàn LED chống cận',                      199000, 299000, 'https://placehold.co/400x400/dfe9e5/12302f/png?text=Den+ban',    '3 chế độ sáng, chỉnh độ sáng vô cấp.'),
  ('Kem chống nắng SPF50+ PA++++',               175000, 230000, 'https://placehold.co/400x400/dfe9e5/12302f/png?text=Kem+chong+nang', 'Kết cấu mỏng nhẹ, không bết dính.'),
  ('Bàn phím cơ mini 61 phím',                   520000, 790000, 'https://placehold.co/400x400/dfe9e5/12302f/png?text=Ban+phim',   'Hot-swap switch, đèn nền RGB.')
) AS v(name, price, original_price, image_url, description)
WHERE NOT EXISTS (SELECT 1 FROM products);
