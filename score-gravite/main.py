# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from typing import List
from datetime import datetime
from collections import defaultdict

from simulation import calculate_cost, future_risk, recommendation

# =========================
# APP
# =========================
app = FastAPI(title="Score Gravité Service")

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# SERVICES URL
# =========================
GEOREF_URL = "http://roadsense-georef:9003/georef"

# =========================
# AUTO-CALIBRAGE
# =========================
SURFACE_HISTORY: List[float] = []
MAX_HISTORY = 100
MIN_SURFACE_REF = 10000

SCORE_HISTORY = defaultdict(list)

# =========================
# MODELES D'ENTREE
# =========================
class ScoreRequest(BaseModel):
    image_id: str
    class_id: int
    confidence: float
    bbox: list
    lon: float
    lat: float


class SimulationRequest(BaseModel):
    damage_type: str
    severity: float

# =========================
# REGLES METIER
# =========================
CLASS_LABELS = {
    0: "pothole",
    1: "crack",
    2: "open_manhole"
}

CLASS_BASE_SCORE = {
    0: 100,
    1: 50,
    2: 90
}

# =========================
# CALCUL SCORE
# =========================
def compute_score(data: ScoreRequest) -> float:
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

    return (
        0.4 * type_score +
        0.2 * confidence_score +
        0.4 * surface_score
    )

# =========================
# PENALITE TEMPORELLE
# =========================
def temporal_penalty(history: list) -> float:
    if not history:
        return 0.0

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
    except Exception:
        return {
            "latitude": lat,
            "longitude": lon
        }

# =========================
# ROUTES
# =========================
@app.get("/health")
def health():
    return {"status": "score-gravite running"}

# =========================
# SCORE + SIMULATION
# =========================
@app.post("/score")
def score_gravite(data: ScoreRequest):

    # 1️⃣ Score brut
    base_score = compute_score(data)

    history = SCORE_HISTORY[data.image_id]
    penalty = temporal_penalty(history)

    final_score = min(round(base_score + penalty, 1), 100)
    final_score_int = int(final_score)

    priorite = priority(final_score)

    SCORE_HISTORY[data.image_id].append({
        "timestamp": datetime.utcnow().isoformat(),
        "score": final_score_int,
        "priorite": priorite
    })

    # 2️⃣ Géoréférencement
    georef_result = send_to_georef(
        image_id=data.image_id,
        lon=data.lon,
        lat=data.lat
    )

    # 3️⃣ Résultat score
    score_payload = {
        "image_id": data.image_id,
        "score": final_score_int,
        "priorite": priorite,
        "location": georef_result
    }

    # 4️⃣ SIMULATION (clé compatible frontend ✅)
    simulation = {
        "estimated_cost": calculate_cost(
            CLASS_LABELS.get(data.class_id, "pothole"),
            final_score_int
        ),
        "risk_30_days": future_risk(final_score_int, 30),
        "risk_60_days": future_risk(final_score_int, 60),
        "recommendation": recommendation(final_score_int)
    }

    return {
        "score_result": score_payload,
        "simulation": simulation
    }

# =========================
# SIMULATION SEULE
# =========================
@app.post("/simulate-cost-impact")
def simulate_cost_impact(data: SimulationRequest):

    severity_int = int(data.severity)

    return {
        "damage_type": data.damage_type,
        "severity_now": severity_int,
        "estimated_cost": calculate_cost(data.damage_type, severity_int),
        "risk_30_days": future_risk(severity_int, 30),
        "risk_60_days": future_risk(severity_int, 60),
        "recommendation": recommendation(severity_int)
    }
