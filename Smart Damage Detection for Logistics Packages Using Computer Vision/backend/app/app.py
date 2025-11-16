# backend/app.py
import os, io, time, uuid, contextlib
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables
load_dotenv(".env")

from services.yolo_service import predict_pil_image, init_model
from services import storage
from db import pg

# --- NEW lifespan version ---
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context replaces deprecated on_event hooks."""
    # Startup tasks
    print("🚀 Starting up FastAPI app...")
    if os.getenv("POSTGRES_DSN"):
        await pg.init_pool()
    init_model()
    yield
    # Shutdown tasks
    print("🧹 Shutting down FastAPI app...")
    if os.getenv("POSTGRES_DSN"):
        await pg.close_pool()

# Create app with lifespan
app = FastAPI(title="Package Damage Detection API", lifespan=lifespan)

# Allow frontend dev server (Angular) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict to localhost:4200 in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def pil_from_bytes(b: bytes):
    img = Image.open(io.BytesIO(b))
    return ImageOps.exif_transpose(img).convert("RGB")

# Pydantic models for request bodies
class MessageCreate(BaseModel):
    author: str
    message: str

@app.get("/api/detect")
async def detect_get_info():
    return {
        "message": "This endpoint accepts POST multipart/form-data with key 'file'. Use POST to upload an image. Example: curl -F \"file=@/path/to/img.jpg\" http://127.0.0.1:8000/api/detect"
    }
@app.post("/api/detect")
async def detect(file: UploadFile = File(...), tracking_code: str = None):
    """Accept an uploaded image, run YOLO detection, store metadata."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    content = await file.read()
    img = pil_from_bytes(content)
    w, h = img.size
    t0 = time.time()

    preds = predict_pil_image(img, imgsz=int(os.getenv("IMG_SZ", 640)), conf=float(os.getenv("CONF_THRESH", 0.25)))

    # optional upload to S3
    orig_s3_url = None
    if os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("S3_BUCKET"):
        key = f"{uuid.uuid4()}/original_{file.filename}"
        try:
            orig_s3_url = storage.upload_bytes_to_s3(key, content, content_type=file.content_type)
        except Exception as e:
            print("S3 upload failed:", e)

    package_id = None
    if os.getenv("POSTGRES_DSN"):
        if len(preds) == 0:
            status, severity, damage_type, confidence = "passed", "success", "None", 1.0
        else:
            top = max(preds, key=lambda p: p['score'])
            damage_type = top['class_name']
            confidence = float(top['score'])
            status = "damaged" if confidence >= 0.4 else "passed"
            severity = "danger" if confidence > 0.85 else ("warning" if confidence > 0.6 else "secondary")
        try:
            tracking_code_val = tracking_code or f"PKG-{str(uuid.uuid4())[:8].upper()}"
            package_id = await pg.insert_package(tracking_code_val, status, severity, damage_type, confidence)
        except Exception as e:
            print("DB insert package error:", e)

    image_id = None
    if os.getenv("POSTGRES_DSN"):
        try:
            image_id = await pg.insert_image(package_id, orig_s3_url)
        except Exception as e:
            print("DB insert image error:", e)

    out_preds = []
    for i, p in enumerate(preds):
        x1, y1, x2, y2 = p['bbox']
        crop = img.crop((x1, y1, x2, y2)).convert("RGB")
        buf = io.BytesIO()
        crop.save(buf, format="JPEG", quality=90)
        crop_bytes = buf.getvalue()

        crop_s3_url = None
        if os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("S3_BUCKET"):
            key = f"{uuid.uuid4()}/pred_{i}_crop.jpg"
            try:
                crop_s3_url = storage.upload_bytes_to_s3(key, crop_bytes, content_type="image/jpeg")
            except Exception as e:
                print("S3 crop upload failed:", e)

        pred_db_id = None
        if os.getenv("POSTGRES_DSN") and image_id:
            try:
                pred_db_id = await pg.insert_prediction(
                    image_id, p['id'], p['class_id'], p['class_name'],
                    float(p['score']), x1, y1, x2, y2, crop_s3_url, None
                )
            except Exception as e:
                print("DB insert prediction error:", e)

        out_preds.append({
            "id": p['id'],
            "class_id": p['class_id'],
            "class_name": p['class_name'],
            "score": p['score'],
            "bbox": p['bbox'],
            "crop_url": crop_s3_url,
            "db_id": pred_db_id
        })

    elapsed = time.time() - t0
    return JSONResponse({
        "package_id": package_id,
        "image_width": w,
        "image_height": h,
        "predictions": out_preds,
        "elapsed": elapsed
    })

@app.post("/api/packages/{package_id}/messages")
async def add_message(package_id: int, message_data: MessageCreate):
    """Add a message/comment to a package."""
    if not os.getenv("POSTGRES_DSN"):
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        result = await pg.insert_message(package_id, message_data.author, message_data.message)
        return JSONResponse({
            "id": result['id'],
            "package_id": package_id,
            "author": message_data.author,
            "message": message_data.message,
            "timestamp": result['timestamp'].isoformat()
        })
    except Exception as e:
        print("Error adding message:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/packages/{package_id}/messages")
async def get_messages(package_id: int):
    """Get all messages/comments for a package."""
    if not os.getenv("POSTGRES_DSN"):
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        messages = await pg.get_messages(package_id)
        # Convert timestamps to ISO format
        for msg in messages:
            if msg.get('timestamp'):
                msg['timestamp'] = msg['timestamp'].isoformat()
        return JSONResponse({"messages": messages})
    except Exception as e:
        print("Error retrieving messages:", e)
        raise HTTPException(status_code=500, detail=str(e))
