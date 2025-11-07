-- backend/db/schema_ui.sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PACKAGES (one row per package inspection / queue entry)
CREATE TABLE IF NOT EXISTS packages (
  package_id TEXT PRIMARY KEY,                 -- e.g. "PKG-2847" (from UI)
  image_id UUID,                               -- optional link to images table (if you store images)
  status TEXT NOT NULL,                        -- 'damaged' | 'passed' | 'pending' | ...
  severity TEXT,                               -- 'danger' | 'warning' | 'success' | 'secondary' (UI badge)
  damage_type TEXT,                            -- e.g. 'Dent', 'Scratch', 'None'
  confidence REAL,                             -- 0.0 - 1.0 (store as fraction)
  inspected_at TIMESTAMPTZ DEFAULT now(),      -- timestamp shown in UI
  inspector_id UUID NULL,                      -- optional FK to users table
  notes TEXT NULL,                             -- operator comments
  reviewed BOOLEAN DEFAULT FALSE,              -- whether human reviewed
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- IMAGES (store original/overlay S3 URLs, dimensions, model_version)
CREATE TABLE IF NOT EXISTS images (
  image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id TEXT NULL,
  filename TEXT,
  s3_url TEXT,
  width INT,
  height INT,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  model_version TEXT
);
ALTER TABLE images ADD CONSTRAINT fk_images_package FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE SET NULL;

-- PREDICTIONS (detection-level rows; one or many per image/package)
CREATE TABLE IF NOT EXISTS predictions (
  id BIGSERIAL PRIMARY KEY,
  image_id UUID REFERENCES images(image_id) ON DELETE CASCADE,
  package_id TEXT NULL,                         -- optional denormalized link back to package
  pred_id TEXT,                                 -- e.g. 'p0'
  class_id INT,
  class_name TEXT,
  score REAL,
  x1 INT, y1 INT, x2 INT, y2 INT,
  crop_s3_url TEXT,
  gradcam_s3_url TEXT,
  low_confidence BOOLEAN DEFAULT FALSE,
  human_label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REVIEWS (human feedback / corrections)
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  package_id TEXT REFERENCES packages(package_id) ON DELETE CASCADE,
  prediction_id BIGINT REFERENCES predictions(id) ON DELETE SET NULL,
  reviewer_id UUID,
  corrected_class TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- USERS (simple inspector table, optional)
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT,
  display_name TEXT,
  email TEXT, 
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes to speed up common queries (dashboard & queue)
CREATE INDEX IF NOT EXISTS idx_packages_inspected_at ON packages(inspected_at DESC);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_damage_type ON packages(damage_type);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_predictions_class_name ON predictions(class_name);

-- A materialized view for daily aggregates (Total inspected, damaged_count, damage_rate)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_stats AS
SELECT
  DATE(inspected_at) AS day,
  COUNT(*) AS total_inspected,
  COUNT(*) FILTER (WHERE status = 'damaged') AS damaged_count,
  (COUNT(*) FILTER (WHERE status = 'damaged')::numeric / NULLIF(COUNT(*),0)) AS damage_rate
FROM packages
GROUP BY DATE(inspected_at);

-- Refresh helper function (call this via cron or scheduler)
CREATE OR REPLACE FUNCTION refresh_mv_daily_stats() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_stats;
EXCEPTION
  WHEN others THEN
    -- if concurrent refresh fails (e.g. first time), do non-concurrent refresh
    REFRESH MATERIALIZED VIEW mv_daily_stats;
END;
$$ LANGUAGE plpgsql;
