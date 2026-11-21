import os
import csv
import glob
import subprocess
from pathlib import Path

DATA_DIR = Path("/home/ds300/Demo-Web/data")
KW_DIR = DATA_DIR / "keywords"
IMG_DIR = DATA_DIR / "image"
PG_CMD = ["psql", "-h", "localhost", "-U", "postgres", "-d", "recsys", "-c"]

os.environ["PGPASSWORD"] = "123456"

def run_sql(sql):
    res = subprocess.run(PG_CMD + [sql], capture_output=True, text=True)
    if res.returncode != 0:
        print("SQL Error:", res.stderr.strip())
    return res.stdout.strip()

print("Connected to DB, populating items and snapshots...")

total_items = 0
total_snaps = 0

for kw_folder in sorted(KW_DIR.iterdir()):
    if not kw_folder.is_dir():
        continue
    kw_id = kw_folder.name
    print(f"\nProcessing keyword: {kw_id}")
    
    csv_files = sorted(kw_folder.glob("????-??-??.csv"))
    for csv_file in csv_files:
        snap_date = csv_file.stem
        with open(csv_file, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            
        print(f"  Importing {csv_file.name} ({len(rows)} rows) ...")
        
        # Batch insert items
        for r in rows:
            iid = int(r["item_id"])
            name = r["name"].replace("'", "''")
            cat = r["category"].replace("'", "''")
            bid = int(r["brand_id"])
            sid = int(r["seller_id"])
            op = float(r["original_price"])
            shop = r["shop_name"].replace("'", "''")
            img = f"/home/ds300/Demo-Web/data/image/{snap_date}/{iid}_main.jpg"
            
            # Upsert item
            item_sql = f"""
                INSERT INTO items (item_id, keyword_id, name, category, brand_id, seller_id, original_price, shop_name, image_path, imported_date)
                VALUES ({iid}, '{kw_id}', '{name}', '{cat}', {bid}, {sid}, {op}, '{shop}', '{img}', '{snap_date}')
                ON CONFLICT (item_id, imported_date) DO UPDATE SET
                    name = EXCLUDED.name,
                    shop_name = EXCLUDED.shop_name,
                    image_path = EXCLUDED.image_path;
            """
            run_sql(item_sql)
            total_items += 1
            
            # Upsert snapshot
            price = float(r["price"])
            disc = float(r["discount_rate"])
            rating = float(r["rating_average"])
            rev = int(r["review_count"])
            sold = float(r["sold_count"])
            
            snap_sql = f"""
                INSERT INTO snapshots (item_id, snapshot_date, price, discount_rate, rating_average, review_count, sold_count)
                VALUES ({iid}, '{snap_date}', {price}, {disc}, {rating}, {rev}, {sold})
                ON CONFLICT (item_id, snapshot_date) DO UPDATE SET
                    price = EXCLUDED.price,
                    discount_rate = EXCLUDED.discount_rate,
                    rating_average = EXCLUDED.rating_average,
                    review_count = EXCLUDED.review_count,
                    sold_count = EXCLUDED.sold_count;
            """
            run_sql(snap_sql)
            total_snaps += 1

            # Image index
            img_sql = f"""
                INSERT INTO image_index (item_id, image_date, file_path)
                VALUES ({iid}, '{snap_date}', '{img}')
                ON CONFLICT (item_id, image_date) DO UPDATE SET file_path = EXCLUDED.file_path;
            """
            run_sql(img_sql)

print(f"\nImport finished! Processed: {total_items} item records, {total_snaps} snapshot records.")
res = run_sql("SELECT count(*) FROM items; SELECT count(*) FROM snapshots; SELECT count(*) FROM image_index;")
print(res)
