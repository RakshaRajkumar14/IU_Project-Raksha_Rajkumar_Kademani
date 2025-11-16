# backend/app/db/pg.py
import os
import asyncpg

_pool = None
POSTGRES_DSN = os.getenv("POSTGRES_DSN")

async def init_pool():
    global _pool
    if _pool is None and POSTGRES_DSN:
        _pool = await asyncpg.create_pool(dsn=POSTGRES_DSN, min_size=1, max_size=5)
        # ensure tables exist
        async with _pool.acquire() as conn:
            await conn.execute(_create_tables_sql())

async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None

def _create_tables_sql():
    return """
    CREATE TABLE IF NOT EXISTS packages (
      id SERIAL PRIMARY KEY,
      tracking_code TEXT,
      status TEXT,
      severity TEXT,
      damage_type TEXT,
      confidence REAL,
      timestamp TIMESTAMP DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      package_id INTEGER REFERENCES packages(id) ON DELETE SET NULL,
      s3_url TEXT,
      timestamp TIMESTAMP DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS predictions (
      id SERIAL PRIMARY KEY,
      image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
      pred_id TEXT,
      class_id INTEGER,
      class_name TEXT,
      score REAL,
      x1 REAL, y1 REAL, x2 REAL, y2 REAL,
      crop_s3_url TEXT,
      timestamp TIMESTAMP DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
      author TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT now()
    );
    """

async def insert_package(tracking_code, status, severity, damage_type, confidence):
    global _pool
    if not _pool:
        raise RuntimeError("DB pool not initialized")
    async with _pool.acquire() as conn:
        row = await conn.fetchrow(
            "INSERT INTO packages (tracking_code,status,severity,damage_type,confidence) VALUES ($1,$2,$3,$4,$5) RETURNING id",
            tracking_code, status, severity, damage_type, confidence
        )
        return row['id']

async def insert_image(package_id, s3_url):
    global _pool
    if not _pool:
        raise RuntimeError("DB pool not initialized")
    async with _pool.acquire() as conn:
        row = await conn.fetchrow(
            "INSERT INTO images (package_id, s3_url) VALUES ($1,$2) RETURNING id",
            package_id, s3_url
        )
        return row['id']

async def insert_prediction(image_id, pred_id, class_id, class_name, score, x1, y1, x2, y2, crop_s3_url, extra_json=None):
    global _pool
    if not _pool:
        raise RuntimeError("DB pool not initialized")
    async with _pool.acquire() as conn:
        row = await conn.fetchrow(
            "INSERT INTO predictions (image_id,pred_id,class_id,class_name,score,x1,y1,x2,y2,crop_s3_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id",
            image_id, pred_id, class_id, class_name, score, x1, y1, x2, y2, crop_s3_url
        )
        return row['id']

async def insert_message(package_id, author, message):
    global _pool
    if not _pool:
        raise RuntimeError("DB pool not initialized")
    async with _pool.acquire() as conn:
        row = await conn.fetchrow(
            "INSERT INTO messages (package_id, author, message) VALUES ($1,$2,$3) RETURNING id, timestamp",
            package_id, author, message
        )
        return {'id': row['id'], 'timestamp': row['timestamp']}

async def get_messages(package_id):
    global _pool
    if not _pool:
        raise RuntimeError("DB pool not initialized")
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, author, message, timestamp FROM messages WHERE package_id = $1 ORDER BY timestamp ASC",
            package_id
        )
        return [dict(row) for row in rows]
