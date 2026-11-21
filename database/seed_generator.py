import os
import csv
import random
from pathlib import Path

KEYWORDS = {
    'ao_thun_nam': {
        'names': [
            'Áo thun nam Cotton Compact co giãn 4 chiều thoáng mát',
            'Áo phông nam cổ tròn basic trơn form rộng unisex',
            'Áo thun nam polo ngắn tay pique phong cách Hàn Quốc',
            'Áo thun nam oversize in hình graphic thời trang đường phố',
            'Áo thun thể thao nam gym running co giãn thấm hút mồ hôi',
            'Áo phông nam tay lỡ vải cotton cao cấp không xù lông',
            'Áo thun nam họa tiết vintage cá tính form chuẩn',
            'Áo thun polo nam cổ dệt cao cấp đi làm đi chơi',
            'Áo phông trơn basic unisex chất liệu cotton 100%',
            'Áo thun nam body fit co giãn tôn dáng trẻ trung'
        ],
        'base_price': (89000, 250000)
    },
    'chuot_khong_day': {
        'names': [
            'Chuột không dây Bluetooth Silent bấm êm chống ồn văn phòng',
            'Chuột gaming không dây 2.4Ghz độ nhạy cao 3200 DPI',
            'Chuột công thái học không dây chống mỏi cổ tay',
            'Chuột máy tính không dây mini sạc pin tiện lợi',
            'Chuột quang không dây tiết kiệm pin kết nối xa 10m',
            'Chuột gaming LED RGB không dây siêu nhẹ chuyên game',
            'Chuột không dây đa kết nối 3 mode Bluetooth + 2.4G',
            'Chuột văn phòng Silent click pin sạc type-C cao cấp'
        ],
        'base_price': (120000, 650000)
    },
    'sua': {
        'names': [
            'Sữa tươi tiệt trùng nguyên chất ít đường lốc 4 hộp 180ml',
            'Sữa dinh dưỡng pha sẵn bổ sung canxi và khoáng chất thùng 48 hộp',
            'Sữa hạt óc chó hạnh nhân cao cấp thơm ngon bổ dưỡng',
            'Sữa chua uống men sống vị dâu tự nhiên thanh mát',
            'Sữa bột công thức phát triển chiều cao và trí não lon 900g',
            'Sữa tươi thanh trùng 100% sữa bò nguyên chất chai 900ml',
            'Sữa yến mạch cao cấp không đường thuần chay hộp 1L'
        ],
        'base_price': (32000, 480000)
    },
    'tai_nghe_khong_day': {
        'names': [
            'Tai nghe Bluetooth không dây True Wireless chống ồn chủ động ANC',
            'Tai nghe không dây pin trâu 40h âm bass mạnh mẽ',
            'Tai nghe chụp tai Bluetooth Over-ear có mic đàm thoại',
            'Tai nghe Bluetooth thể thao chống nước IPX5 kèm hộp sạc LED',
            'Tai nghe không dây gaming độ trễ thấp 45ms âm vòm 3D',
            'Tai nghe TWS cảm ứng chạm thông minh kết nối tự động',
            'Tai nghe không dây mini nhét tai siêu nhỏ gọn đeo êm tai'
        ],
        'base_price': (150000, 1200000)
    }
}

DATES = ['2026-11-01', '2026-11-10', '2026-11-15', '2026-11-21']
SHOPS = ['Shopee Mall Chính Hãng', 'Tech Store Official', 'Thời Trang Trẻ', 'Healthy Milk VN', 'Phụ Kiện Số 247']

data_dir = Path('/home/ds300/Demo-Web/data')
kw_base = data_dir / 'keywords'
img_base = data_dir / 'image'

for kw_id, kw_info in KEYWORDS.items():
    kw_dir = kw_base / kw_id
    kw_dir.mkdir(parents=True, exist_ok=True)
    
    items = []
    for i in range(1, 41):
        item_id = int(f'{random.randint(10, 99)}{random.randint(100000, 999999)}')
        name_template = random.choice(kw_info['names'])
        name = f'{name_template} #{i}'
        orig_price = round(random.uniform(*kw_info['base_price']) / 1000) * 1000
        brand_id = random.randint(1, 50)
        seller_id = random.randint(1, 100)
        shop_name = random.choice(SHOPS)
        items.append({
            'item_id': item_id,
            'name': name,
            'orig_price': orig_price,
            'brand_id': brand_id,
            'seller_id': seller_id,
            'shop_name': shop_name
        })

    accum_sold = {item['item_id']: random.randint(50, 500) for item in items}
    accum_reviews = {item['item_id']: random.randint(10, 100) for item in items}

    for d in DATES:
        csv_path = kw_dir / f'{d}.csv'
        img_dir = img_base / d
        img_dir.mkdir(parents=True, exist_ok=True)
        
        rows = []
        for item in items:
            iid = item['item_id']
            if d == '2026-11-10' or d == '2026-11-21':
                discount = random.choice([0.1, 0.2, 0.35, 0.5])
            else:
                discount = random.choice([0.0, 0.05, 0.15])
            
            price = round(item['orig_price'] * (1.0 - discount) / 1000) * 1000
            accum_sold[iid] += random.randint(5, 50)
            accum_reviews[iid] += random.randint(1, 10)
            rating = round(random.uniform(4.2, 5.0), 1)

            img_file = img_dir / f'{iid}_main.jpg'
            if not img_file.exists():
                with open(img_file, 'wb') as f_img:
                    f_img.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' \",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9')

            rows.append({
                'item_id': iid,
                'name': item['name'],
                'category': kw_id,
                'brand_id': item['brand_id'],
                'seller_id': item['seller_id'],
                'original_price': item['orig_price'],
                'shop_name': item['shop_name'],
                'price': price,
                'discount_rate': round(discount * 100, 1),
                'rating_average': rating,
                'review_count': accum_reviews[iid],
                'sold_count': accum_sold[iid]
            })
            
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)
            
print('Seed dataset generated successfully at /home/ds300/Demo-Web/data')
