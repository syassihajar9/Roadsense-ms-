from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from typing import List
from datetime import datetime
from collections import defaultdict

app = FastAPI(title="Score Gravité Service")

# =========================
# CORS (CORRIGÉ)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ CORS ouvert (DEV)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# SERVICES URL (DOCKER)
# =========================
PRIORITISATION_URL = "http://roadsense-prioritisation:9005/prioritise"
GEOREF_URL = "http://roadsense-georef:9003/georef"

# =========================
# AUTO-CALIBRAGE
# =========================
SURFACE_HISTORY: List[float] = []
MAX_HISTORY = 100
MIN_SURFACE_REF = 10000

SCORE_HISTORY = defaultdict(list)

# =========================
# MODELE D'ENTREE
# =========================
class ScoreRequest(BaseModel):
    image_id: str
    class_id: int
    confidence: float
    bbox: list
    lon: float
    lat: float

# =========================
# REGLES METIER
# =========================
CLASS_LABELS = {
    0: "Pothole",
    1: "Crack",
    2: "Open_Manhole"
}

CLASS_BASE_SCORE = {
    0: 100,
    1: 50,
    2: 90
}

# =========================
# CALCUL SCORE
# =========================
def compute_score(data: ScoreRequest):
    type_score = CLASS_BASE_SCORE.get(data.class_id, 30)
    confidence_score = data.confidence * 100

    x1, y1, x2, y2 = data.bbox
    surface = max(x2 - x1, 0) * max(y2 - y1, 0)

    SURFACE_HISTORY.append(surface)
    if len(SURFACE_HISTORY) > MAX_HISTORY:
        SURFACE_HISTORY.pop(0)

    surface_ref = max(
        sum(SURFACE_HISTORY) / len(SURFACE_HISTORY),
        MIN_SURFACE_REF
    )

    surface_score = min(surface / surface_ref, 1.0) * 100

    base_score = (
        0.4 * type_score +
        0.2 * confidence_score +
        0.4 * surface_score
    )

    explanation = {
        "type": CLASS_LABELS.get(data.class_id, "Unknown"),
        "confidence": round(confidence_score, 1),
        "surface": round(surface_score, 1)
    }

    return base_score, explanation

# =========================
# PENALITE TEMPORELLE
# =========================
def temporal_penalty(history: list) -> float:
    if not history:
        return 0

    first_time = datetime.fromisoformat(history[0]["timestamp"])
    now = datetime.utcnow()
    weeks = (now - first_time).days / 7
    return min(weeks * 5, 30)

# =========================
# PRIORITE
# =========================
def priority(score: float) -> str:
    if score >= 75:
        return "CRITIQUE"
    elif score >= 50:
        return "HAUTE"
    elif score >= 25:
        return "MOYENNE"
    else:
        return "FAIBLE"

# =========================
# APPEL GEOREF
# =========================
def send_to_georef(image_id: str, lon: float, lat: float):
    try:
        response = requests.post(
            GEOREF_URL,
            json={
                "image_id": image_id,
                "lon": lon,
                "lat": lat,
                "altitude": 0
            },
            timeout=3
        )
        return response.json()
    except Exception as e:
        return {"error": "georef unreachable", "details": str(e)}

# =========================
# ROUTES
# =========================
@app.get("/health")
def health():
    return {"status": "score-gravite running"}

@app.post("/score")
def score_gravite(data: ScoreRequest):

    # 1️⃣ Calcul score
    base_score, explanation = compute_score(data)

    history = SCORE_HISTORY[data.image_id]
    penalty = temporal_penalty(history)

    final_score = min(round(base_score + penalty, 1), 100)
    priorite = priority(final_score)

    timestamp = datetime.utcnow().isoformat()
    SCORE_HISTORY[data.image_id].append({
        "timestamp": timestamp,
        "score": final_score,
        "priorite": priorite
    })

    # 2️⃣ Appel GEOREF
    georef_result = send_to_georef(
        image_id=data.image_id,
        lon=data.lon,
        lat=data.lat
    )

    # 3️⃣ Payload vers priorisation
    score_payload = {
        "image_id": data.image_id,
        "score": final_score,
        "priorite": priorite,
        "location": georef_result
    }

    try:
        response = requests.post(
            PRIORITISATION_URL,
            json=score_payload,
            timeout=3
        )
        prioritisation_result = response.json()
    except Exception as e:
        return {
            "error": "prioritisation unreachable",
            "score_result": score_payload,
            "details": str(e)
        }

    return {
        "score_result": score_payload,
        "prioritisation": prioritisation_result
    }
