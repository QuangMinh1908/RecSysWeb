-- ============================================================
-- Demo-Web: PostgreSQL Schema (recsys database)
-- ============================================================

CREATE DATABASE recsys;
\c recsys

CREATE TABLE IF NOT EXISTS keywords (
    keyword_id   VARCHAR(100) PRIMARY KEY,
    display_name VARCHAR(255),
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
    item_id        BIGINT       NOT NULL,
    keyword_id     VARCHAR(100) REFERENCES keywords(keyword_id),
    name           TEXT         NOT NULL,
    category       VARCHAR(100),
    brand_id       INT          DEFAULT 0,
    seller_id      INT          DEFAULT 0,
    original_price FLOAT,
    shop_name      VARCHAR(255),
    image_path     TEXT,
    imported_date  DATE         NOT NULL,
    created_at     TIMESTAMP    DEFAULT NOW(),
    PRIMARY KEY (item_id, imported_date)
);

CREATE TABLE IF NOT EXISTS snapshots (
    id             BIGSERIAL PRIMARY KEY,
    item_id        BIGINT  NOT NULL,
    snapshot_date  DATE    NOT NULL,
    price          FLOAT,
    discount_rate  FLOAT   DEFAULT 0.0,
    rating_average FLOAT   DEFAULT 4.5,
    review_count   INT     DEFAULT 0,
    sold_count     FLOAT   DEFAULT 0.0,
    UNIQUE (item_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS image_index (
    item_id     BIGINT,
    image_date  DATE,
    file_path   TEXT,
    PRIMARY KEY (item_id, image_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_items_keyword_date ON items(keyword_id, imported_date DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_item     ON snapshots(item_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_items_itemid       ON items(item_id);

-- Seed keywords
INSERT INTO keywords (keyword_id, display_name) VALUES
    ('ao_thun_nam',       'Áo Thun Nam'),
    ('chuot_khong_day',   'Chuột Không Dây'),
    ('sua',               'Sữa'),
    ('tai_nghe_khong_day','Tai Nghe Không Dây')
ON CONFLICT DO NOTHING;

SELECT 'Schema created successfully!' AS status;
