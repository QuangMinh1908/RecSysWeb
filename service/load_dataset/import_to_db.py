#!/usr/bin/env python3
"""
=============================================================================
SHOPEE TEMPORAL RECSYS - DATASET TO POSTGRESQL IMPORT SERVICE
Script đọc dữ liệu từ thư mục dataset/ (image_index.csv, keywords/*.csv)
và nạp vào các bảng PostgreSQL: keywords, items, snapshots, image_index.
=============================================================================
"""

import os
import sys
import re
import csv
import glob
import time
import argparse
from pathlib import Path
from typing import Dict, Tuple, List, Optional
import psycopg2
from psycopg2.extras import execute_values

# Đường dẫn mặc định
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DATASET_DIR = BASE_DIR / "dataset"
LOG_FILE = BASE_DIR / "service" / "activity.log"

def write_activity_log(message: str):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] [DATASET_IMPORT] {message}
"
    try:
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line)
    except Exception as e:
        print(f"Warning: Could not write to log: {e}")


KEYWORD_NAME_MAP = {
    "chuot_khong_day": "Chuột Không Dây",
    "laptop": "Laptop & Máy Tính",
    "sua": "Sữa & Bỉm",
    "tai_nghe_khong_day": "Tai Nghe Không Dây",
    "ao_thun_nam": "Áo Thun Nam"
}

def normalize_keyword_id(raw_name: str) -> Tuple[str, str]:
    """
    Chuẩn hóa tên thư mục (ví dụ: 'chuot-khong-day-a2ac')
    -> keyword_id: 'chuot_khong_day'
    -> display_name: 'Chuột Không Dây'
    """
    cleaned = re.sub(r'-[0-9a-f]{4,8}$', '', raw_name.strip())
    kw_id = cleaned.replace('-', '_')
    display_name = KEYWORD_NAME_MAP.get(kw_id, kw_id.replace('_', ' ').title())
    return kw_id, display_name

def connect_db(host, port, dbname, user, password):
    print(f"[*] Kết nối đến PostgreSQL: {user}@{host}:{port}/{dbname}...")
    conn = psycopg2.connect(
        host=host,
        port=port,
        dbname=dbname,
        user=user,
        password=password
    )
    conn.autocommit = False
    return conn

def load_image_index(conn, dataset_dir: Path) -> Dict[Tuple[int, str], str]:
    """
    Nạp image_index.csv vào bộ nhớ & bảng image_index trong database.
    Trả về dict {(product_id, snapshot_date): full_image_path}
    """
    csv_file = dataset_dir / "image_index.csv"
    if not csv_file.exists():
        print(f"[!] Không tìm thấy file {csv_file}, bỏ qua nạp image_index.")
        return {}

    print(f"\n[1/3] Đang nạp bảng ánh xạ ảnh: {csv_file}...")
    index_map = {}
    rows_to_insert = []
    
    with open(csv_file, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for r in reader:
            pid_str = r.get("product_id")
            snap_date = r.get("snapshot")
            img_file = r.get("image_file")
            if not pid_str or not snap_date or not img_file:
                continue
            try:
                pid = int(pid_str)
                # Đường dẫn tuyệt đối của ảnh
                full_path = str(dataset_dir / img_file)
                index_map[(pid, snap_date)] = full_path
                rows_to_insert.append((pid, snap_date, full_path))
            except ValueError:
                continue

    print(f"    -> Đã đọc {len(rows_to_insert):,} dòng ánh xạ ảnh từ file CSV.")

    # Nạp vào database table image_index
    if rows_to_insert:
        cur = conn.cursor()
        insert_sql = """
            INSERT INTO image_index (item_id, image_date, file_path)
            VALUES %s
            ON CONFLICT (item_id, image_date) 
            DO UPDATE SET file_path = EXCLUDED.file_path;
        """
        batch_size = 5000
        for i in range(0, len(rows_to_insert), batch_size):
            chunk = rows_to_insert[i:i + batch_size]
            execute_values(cur, insert_sql, chunk)
        conn.commit()
        cur.close()
        print(f"    -> Đã cập nhật xong bảng [image_index] trong database.")

    return index_map

def import_keywords_and_snapshots(conn, dataset_dir: Path, image_map: Dict[Tuple[int, str], str], batch_size: int = 2000):
    """
    Quét thư mục dataset/keywords/, nạp các sản phẩm và snapshot theo chuỗi ngày.
    """
    keywords_dir = dataset_dir / "keywords"
    if not keywords_dir.exists():
        print(f"[!] Không tìm thấy thư mục {keywords_dir}!")
        return

    cur = conn.cursor()
    category_dirs = sorted([d for d in keywords_dir.iterdir() if d.is_dir()])
    print(f"\n[2/3] Bắt đầu nạp dữ liệu từ {len(category_dirs)} danh mục sản phẩm...")

    total_items_saved = 0
    total_snapshots_saved = 0

    for cat_dir in category_dirs:
        raw_name = cat_dir.name
        kw_id, display_name = normalize_keyword_id(raw_name)
        print(f"\n  • Danh mục: [{display_name}] (ID: {kw_id}, Thư mục: {raw_name})")

        # 1. Đảm bảo category tồn tại trong bảng keywords
        cur.execute("""
            INSERT INTO keywords (keyword_id, display_name)
            VALUES (%s, %s)
            ON CONFLICT (keyword_id) 
            DO UPDATE SET display_name = EXCLUDED.display_name;
        """, (kw_id, display_name))
        conn.commit()

        # 2. Tìm các file snapshot theo định dạng YYYY-MM-DD.csv (bỏ qua các file phụ _detail, _raw...)
        csv_files = sorted([
            f for f in cat_dir.glob("????-??-??.csv") 
            if not f.name.endswith(('_detail.csv', '_listing.csv'))
        ])
        print(f"    -> Tìm thấy {len(csv_files)} file snapshots chuỗi ngày.")

        for csv_path in csv_files:
            file_date = csv_path.stem  # Ví dụ '2026-10-22'
            items_chunk = []
            snapshots_chunk = []

            with open(csv_path, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    id_raw = row.get("id") or row.get("item_id")
                    if not id_raw:
                        continue
                    try:
                        item_id = int(id_raw)
                    except ValueError:
                        continue

                    name = (row.get("name") or "Sản phẩm Shopee").strip()
                    try:
                        price = float(row.get("price") or 0.0)
                    except ValueError:
                        price = 0.0

                    try:
                        orig_price = float(row.get("original_price") or price)
                    except ValueError:
                        orig_price = price

                    try:
                        discount = float(row.get("discount_rate") or 0.0)
                    except ValueError:
                        discount = 0.0

                    try:
                        rating = float(row.get("rating_average") or 4.5)
                        if rating <= 0:
                            rating = 4.5
                    except ValueError:
                        rating = 4.5

                    try:
                        review_count = int(float(row.get("review_count") or 0))
                    except ValueError:
                        review_count = 0

                    try:
                        sold_count = float(row.get("sold_count") or 0.0)
                    except ValueError:
                        sold_count = 0.0

                    try:
                        seller_id = int(row.get("seller_id") or 0)
                    except ValueError:
                        seller_id = 0

                    shop_name = (row.get("seller_name") or row.get("shop_name") or "CHÍNH HÃNG").strip()

                    # Tìm đường dẫn ảnh
                    # Ưu tiên 1: Lấy từ file ảnh đã tải qua image_index
                    image_path = image_map.get((item_id, file_date))
                    if not image_path:
                        # Ưu tiên 2: URL ảnh gốc Shopee
                        image_path = row.get("main_image_url") or row.get("thumbnail_url") or ""

                    # Thuộc tính bản ghi items
                    items_chunk.append((
                        item_id,
                        kw_id,
                        name,
                        kw_id,       # category
                        0,           # brand_id
                        seller_id,
                        orig_price,
                        shop_name,
                        image_path,
                        file_date    # imported_date
                    ))

                    # Thuộc tính bản ghi snapshots
                    snapshots_chunk.append((
                        item_id,
                        file_date,   # snapshot_date
                        price,
                        discount,
                        rating,
                        review_count,
                        sold_count
                    ))

            # Batch Insert / Update bảng items
            if items_chunk:
                item_sql = """
                    INSERT INTO items (
                        item_id, keyword_id, name, category, brand_id, seller_id,
                        original_price, shop_name, image_path, imported_date
                    ) VALUES %s
                    ON CONFLICT (item_id, imported_date)
                    DO UPDATE SET
                        name = EXCLUDED.name,
                        original_price = EXCLUDED.original_price,
                        shop_name = EXCLUDED.shop_name,
                        image_path = EXCLUDED.image_path;
                """
                for i in range(0, len(items_chunk), batch_size):
                    execute_values(cur, item_sql, items_chunk[i:i + batch_size])
                total_items_saved += len(items_chunk)

            # Batch Insert / Update bảng snapshots
            if snapshots_chunk:
                snap_sql = """
                    INSERT INTO snapshots (
                        item_id, snapshot_date, price, discount_rate,
                        rating_average, review_count, sold_count
                    ) VALUES %s
                    ON CONFLICT (item_id, snapshot_date)
                    DO UPDATE SET
                        price = EXCLUDED.price,
                        discount_rate = EXCLUDED.discount_rate,
                        rating_average = EXCLUDED.rating_average,
                        review_count = EXCLUDED.review_count,
                        sold_count = EXCLUDED.sold_count;
                """
                for i in range(0, len(snapshots_chunk), batch_size):
                    execute_values(cur, snap_sql, snapshots_chunk[i:i + batch_size])
                total_snapshots_saved += len(snapshots_chunk)

            conn.commit()
            print(f"      + Snapshot [{file_date}]: Đã nạp {len(items_chunk):,} SP & {len(snapshots_chunk):,} snapshots")

    cur.close()
    return total_items_saved, total_snapshots_saved

def setup_image_symlink(dataset_dir: Path):
    """
    Tạo symlink từ dataset/image sang data/image nếu chưa có,
    để Backend và Frontend truy cập ảnh mượt mà không cần sửa code.
    """
    dataset_img = dataset_dir / "image"
    data_img = dataset_dir.parent / "data" / "image"
    
    if dataset_img.exists() and not data_img.exists():
        try:
            data_img.parent.mkdir(parents=True, exist_ok=True)
            os.symlink(dataset_img, data_img)
            print(f"\n[3/3] Đã tạo liên kết ảnh: {data_img} -> {dataset_img}")
        except Exception as e:
            print(f"\n[3/3] Lưu ý tạo liên kết ảnh: {e}")
    else:
        print(f"\n[3/3] Thư mục ảnh đã sẵn sàng tại: {dataset_img}")

def main():
    parser = argparse.ArgumentParser(description="Nạp Shopee Dataset từ thư mục dataset/ vào PostgreSQL.")
    parser.add_argument("--dataset-dir", default=str(DEFAULT_DATASET_DIR), help="Đường dẫn thư mục dataset")
    parser.add_argument("--db-host", default=os.getenv("DB_HOST", "localhost"), help="PostgreSQL host")
    parser.add_argument("--db-port", default=int(os.getenv("DB_PORT", 5432)), help="PostgreSQL port")
    parser.add_argument("--db-name", default=os.getenv("DB_NAME", "recsys"), help="Tên database")
    parser.add_argument("--db-user", default=os.getenv("DB_USER", "postgres"), help="Username database")
    parser.add_argument("--db-password", default=os.getenv("DB_PASSWORD", "123456"), help="Mật khẩu database")
    parser.add_argument("--batch-size", default=2000, type=int, help="Kích thước batch insert")

    args = parser.parse_args()
    dataset_dir = Path(args.dataset_dir).resolve()

    print("=" * 65)
    print("       CÔNG CỤ NẠP DỮ LIỆU DATASET VÀO POSTGRESQL (RECSYS)       ")
    print("=" * 65)
    print(f"• Thư mục Dataset: {dataset_dir}")
    print(f"• Database Target: {args.db_user}@{args.db_host}:{args.db_port}/{args.db_name}")

    if not dataset_dir.exists():
        print(f"\n[LỖI] Thư mục dataset không tồn tại: {dataset_dir}")
        sys.exit(1)

    start_time = time.time()
    conn = connect_db(args.db_host, args.db_port, args.db_name, args.db_user, args.db_password)

    try:
        # Bước 1: Nạp image_index
        image_map = load_image_index(conn, dataset_dir)

        # Bước 2: Nạp keywords, items và snapshots
        items_count, snaps_count = import_keywords_and_snapshots(conn, dataset_dir, image_map, args.batch_size)

        # Bước 3: Đồng bộ liên kết thư mục ảnh
        setup_image_symlink(dataset_dir)

        duration = time.time() - start_time
        write_activity_log(f"SUCCESS | Imported {items_count:,} items, {snaps_count:,} snapshots, {len(image_map):,} images in {duration:.2f}s")
        print("\n" + "=" * 65)
        print("                 KẾT QUẢ NẠP DỮ LIỆU THÀNH CÔNG                  ")
        print("=" * 65)
        print(f"✓ Tổng số bản ghi sản phẩm nạp/cập nhật:  {items_count:,}")
        print(f"✓ Tổng số snapshot giá chuỗi ngày:        {snaps_count:,}")
        print(f"✓ Tổng số ảnh được liên kết:              {len(image_map):,}")
        print(f"✓ Thời gian thực thi:                     {duration:.2f} giây")
        print("=" * 65)

    except Exception as e:
        conn.rollback()
        print(f"\n[!] Gặp lỗi trong quá trình nạp dữ liệu: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    main()
