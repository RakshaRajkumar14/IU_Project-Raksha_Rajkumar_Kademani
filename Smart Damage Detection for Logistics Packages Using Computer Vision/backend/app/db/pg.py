# backend/db/pg.py
import os
import asyncpg
from typing import Optional

POSTGRES_DSN = os.getenv("POSTGRES_DSN")  # e.g. postgresql://user:pass@localhost:5432/packageai

_pool: Optional[asyncpg.Pool] = None

async def init_pool():
    global _pool
    if _pool is None:
        if not POSTGRES_DSN:
            raise RuntimeError("POSTGRES_DSN not set")
        _pool = await asyncpg.create_pool(dsn=POSTGRES_DSN, min_size=1, max_size=10)
    return _pool

async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None

async def insert_package(tracking_code: str, status: str, severity: str, damage_type: str, confidence: float, inspected_at=None):
    pool = await init_pool()
    q = """
    INSERT INTO packages (tracking_code, status, severity, damage_type, confidence, timestamp)
    VALUES ($1,$2,$3,$4,$5, COALESCE($6, now()))
    RETURNING package_id;
    """
    row = await pool.fetchrow(q, tracking_code, status, severity, damage_type, confidence, inspected_at)
    return row['package_id']

async def insert_image(package_id: int, original_s3_url: str = None):
    pool = await init_pool()
    q = """
    INSERT INTO inspection_images (package_id, original_image_url, uploaded_at)
    VALUES ($1, $2, now())
    RETURNING image_id;
    """
    row = await pool.fetchrow(q, package_id, original_s3_url)
    return row['image_id']

async def insert_prediction(image_id: int, pred_id: str, class_id: int, class_name: str, score: float, x1:int,y1:int,x2:int,y2:int, crop_s3_url: str = None, gradcam_s3_url: str = None):
    pool = await init_pool()
    q = """
    INSERT INTO predictions (image_id, pred_id, class_id, class_name, score, x1, y1, x2, y2, crop_s3_url, gradcam_s3_url, created_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, now())
    RETURNING id;
    """
    row = await pool.fetchrow(q, image_id, pred_id, class_id, class_name, score, x1,y1,x2,y2, crop_s3_url, gradcam_s3_url)
    return row['id']
