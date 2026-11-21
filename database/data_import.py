#!/usr/bin/env python3
"""
DataImportJob: Import HuggingFace CSV dataset -> PostgreSQL recsys database
Usage: python3 data_import.py --data-dir /path/to/hf_data --pg-url postgresql://user:pass@localhost/recsys
"""
import os
import sys
import re
import csv
import argparse
import logging
from pathlib import Path
from datetime import date
import psycopg2
from psycopg2.extras import execute_batch

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

KEYWORDS = {
    "ao_thun_nam":        "Ao Thun Nam",
    "chuot_khong_day":    "Chuot Khong Day",
    "sua":                "Sua",
    "tai_nghe_khong_day": "Tai Nghe Khong Day",
}

def connect(pg_url: str):
    return psycopg2.connect(pg_url)

def parse_date(filename: str):
    """Extract YYYY-MM-DD from filename like 2026-11-21.csv or 2026-11-21_listing.csv"""
    m = re.match(r"(\d{4}-\d{2}-\d{2})", filename)
    return m.group(1) if m else None

def safe_float(val, default=0.0):
    try:
        return float(val) if val and val.strip() else default
    except:
        return default

def safe_int(val, default=0):
    try:
        return int(float(val)) if val and val.strip() else default
    except:
        return default

def import_keyword(conn, keyword_id: str, keyword_dir: Path, image_base: Path):
    """Import all CSVs for one keyword into DB."""
    cur = conn.cursor()
    
    # Find all merged CSV files (YYYY-MM-DD.csv, no suffix)
    csv_files = []
    for f in keyword_dir.iterdir():
        if f.suffix == ".csv" and re.match(r"^\d{4}-\d{2}-\d{2}\.csv$", f.name):
            d = parse_date(f.name)
            if d:
                csv_files.append((d, f))
    
    if not csv_files:
        log.warning(f"  No merged CSVs found in {keyword_dir}")
        return 0
    
    total_items = 0
    for snap_date, csv_path in sorted(csv_files):
        log.info(f"  Importing {csv_path.name} ...")
        try:
            with open(csv_path, encoding="utf-8") as f:
                reader = csv.DictReader(f)
                rows = list(reader)
            
            if not rows:
                continue
            
            # Detect columns (flexible mapping)
            cols = set(rows[0].keys())
            
            items_data = []
            snap_data = []
            
            for row in rows:
                # Map common column names
                item_id = safe_int(row.get("item_id") or row.get("itemid") or row.get("id"))
                if item_id == 0:
                    continue
                
                name     = (row.get("name") or row.get("item_name") or "")[:500]
                category = row.get("category") or keyword_id
                brand_id  = safe_int(row.get("brand_id") or row.get("brandid"))
                seller_id = safe_int(row.get("seller_id") or row.get("shopid") or row.get("shop_id"))
                orig_price = safe_float(row.get("original_price") or row.get("price_before_discount") or row.get("price"))
                shop_name  = (row.get("shop_name") or row.get("shopname") or "")[:255]
                
                # Image path
                img_path = str(image_base / snap_date / f"{item_id}_main.jpg")
                
                items_data.append((
                    item_id, keyword_id, name, category,
                    brand_id, seller_id, orig_price, shop_name,
                    img_path, snap_date
                ))
                
                # Snapshot row
                price     = safe_float(row.get("price") or row.get("current_price") or orig_price)
                disc      = safe_float(row.get("discount_rate") or row.get("discount"))
                rating    = safe_float(row.get("rating_average") or row.get("rating") or row.get("item_rating"), 4.5)
                reviews   = safe_int(row.get("review_count") or row.get("cmt_count"))
                sold      = safe_float(row.get("sold_count") or row.get("sold") or row.get("historical_sold"))
                
                snap_data.append((item_id, snap_date, price, disc, rating, reviews, sold))
            
            # Upsert items
            execute_batch(cur, """
                INSERT INTO items (item_id, keyword_id, name, category, brand_id, seller_id,
                                   original_price, shop_name, image_path, imported_date)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (item_id, imported_date) DO UPDATE SET
                    name=EXCLUDED.name, shop_name=EXCLUDED.shop_name,
                    image_path=EXCLUDED.image_path
            """, items_data, page_size=200)
            
            # Upsert snapshots
            execute_batch(cur, """
                INSERT INTO snapshots (item_id, snapshot_date, price, discount_rate,
                                       rating_average, review_count, sold_count)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (item_id, snapshot_date) DO UPDATE SET
                    price=EXCLUDED.price, discount_rate=EXCLUDED.discount_rate,
                    rating_average=EXCLUDED.rating_average,
                    review_count=EXCLUDED.review_count, sold_count=EXCLUDED.sold_count
            """, snap_data, page_size=200)
            
            # Upsert image_index
            img_idx = []
            img_dir = image_base / snap_date
            if img_dir.exists():
                for img_file in img_dir.iterdir():
                    m = re.match(r"^(\d+)_main\.jpg$", img_file.name)
                    if m:
                        img_idx.append((int(m.group(1)), snap_date, str(img_file)))
                execute_batch(cur, """
                    INSERT INTO image_index (item_id, image_date, file_path)
                    VALUES (%s,%s,%s)
                    ON CONFLICT (item_id, image_date) DO UPDATE SET file_path=EXCLUDED.file_path
                """, img_idx, page_size=500)
                log.info(f"    -> {len(img_idx)} images indexed")
            
            conn.commit()
            log.info(f"    -> {len(items_data)} items + {len(snap_data)} snapshots committed")
            total_items += len(items_data)
            
        except Exception as e:
            conn.rollback()
            log.error(f"  Error importing {csv_path}: {e}")
    
    cur.close()
    return total_items


def main():
    parser = argparse.ArgumentParser(description="Import HuggingFace CSV dataset to PostgreSQL")
    parser.add_argument("--data-dir",  required=True, help="Root dir of HF dataset (contains keywords/ and image/)")
    parser.add_argument("--pg-url",    required=True, help="PostgreSQL URL: postgresql://user:pass@host/recsys")
    parser.add_argument("--keyword",   default=None,  help="Import single keyword only (optional)")
    args = parser.parse_args()
    
    data_dir   = Path(args.data_dir)
    kw_base    = data_dir / "keywords"
    image_base = data_dir / "image"
    
    if not kw_base.exists():
        log.error(f"keywords/ directory not found in {data_dir}")
        sys.exit(1)
    
    log.info(f"Connecting to PostgreSQL ...")
    conn = connect(args.pg_url)
    log.info("Connected!")
    
    keywords_to_import = [args.keyword] if args.keyword else list(KEYWORDS.keys())
    
    grand_total = 0
    for kw_id in keywords_to_import:
        kw_dir = kw_base / kw_id
        if not kw_dir.exists():
            log.warning(f"Skipping {kw_id}: directory not found")
            continue
        log.info(f"\n=== Importing keyword: {kw_id} ===")
        n = import_keyword(conn, kw_id, kw_dir, image_base)
        grand_total += n
    
    conn.close()
    log.info(f"\nDone! Total items imported: {grand_total}")


if __name__ == "__main__":
    main()
