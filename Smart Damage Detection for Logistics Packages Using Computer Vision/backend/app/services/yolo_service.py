# backend/app/services/yolo_service.py
import os
from typing import List, Dict, Any, Optional
from PIL import Image

YOLO_WEIGHTS = os.getenv("YOLO_WEIGHTS", "models/best.pt")  # safe default (relative to backend/app)
_detector = None

def init_model():
    """Call this in FastAPI startup. Loads YOLO model once."""
    global _detector
    if _detector is None:
        try:
            from ultralytics import YOLO
        except Exception as e:
            raise RuntimeError(f"Failed to import ultralytics: {e}") from e
        # print path for debugging
        print(f"Initializing YOLO model from: {YOLO_WEIGHTS}")
        _detector = YOLO(YOLO_WEIGHTS)
    return _detector

def get_detector():
    if _detector is None:
        raise RuntimeError("YOLO model not initialized. Call init_model() in FastAPI startup.")
    return _detector

def predict_pil_image(img: Image.Image, imgsz: int = 640, conf: float = 0.25) -> List[Dict[str, Any]]:
    """Run inference on a PIL image. Returns list of predictions."""
    det = get_detector()
    results = det.predict(img, imgsz=imgsz, conf=conf, verbose=False)
    r = results[0]
    preds = []
    for i, box in enumerate(r.boxes):
        xyxy = box.xyxy[0].tolist()
        x1, y1, x2, y2 = map(int, xyxy)
        score = float(box.conf[0])
        class_id = int(box.cls[0])
        # obtain class name if available
        class_name = det.model.names[class_id] if hasattr(det, "model") else str(class_id)
        preds.append({
            "id": f"p{i}",
            "bbox": [x1, y1, x2, y2],
            "score": score,
            "class_id": class_id,
            "class_name": class_name
        })
    return preds
