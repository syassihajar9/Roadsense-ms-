from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from ultralytics import YOLO
import cv2
import os
import uuid
import traceback

MODEL_PATH = "best.pt"
UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = "results"

DAMAGE_CLASSES = {
    0: "Pothole",
    1: "Crack",
    2: "Open_Manhole"
}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

app = FastAPI(title="Detection Fissures API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🚀 Chargement du modèle YOLO...")
model = YOLO(MODEL_PATH)
model.to("cpu")
print("✅ Modèle YOLO chargé")

@app.get("/health")
def health():
    return {"status": "detection-fissures running"}

@app.get("/results/{filename}")
def get_result(filename: str):
    path = os.path.join(RESULT_FOLDER, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image non trouvée")
    return FileResponse(path)

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    try:
        image_id = str(uuid.uuid4())
        filename = f"{image_id}.jpg"
        input_path = os.path.join(UPLOAD_FOLDER, filename)

        with open(input_path, "wb") as f:
            f.write(await file.read())

        img = cv2.imread(input_path)
        if img is None:
            raise HTTPException(status_code=400, detail="Image invalide")

        img = cv2.resize(img, (640, 640))

        results = model(img, conf=0.35, verbose=False)
        result = results[0]

        damages = []
        if result.boxes is not None:
            for box, cls, conf in zip(
                result.boxes.xyxy,
                result.boxes.cls,
                result.boxes.conf
            ):
                damages.append({
                    "class": DAMAGE_CLASSES.get(int(cls), "Unknown"),
                    "confidence": round(float(conf), 3),
                    "bbox": [round(float(x), 2) for x in box.tolist()]
                })

        annotated = result.plot(img=img)
        annotated = cv2.resize(annotated, (640, 640))

        output_filename = f"annotated_{filename}"
        output_path = os.path.join(RESULT_FOLDER, output_filename)
        cv2.imwrite(output_path, annotated)

        return {
            "image_id": image_id,
            "total_damages": len(damages),
            "damages": damages,
            "annotated_image_url": f"/results/{output_filename}"
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def stats():
    return {
        "model": MODEL_PATH,
        "classes": DAMAGE_CLASSES
    }
