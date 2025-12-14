from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Prioritisation Service")

# ===== Entrée =====
class PriorityRequest(BaseModel):
    image_id: str
    score: int
    priorite: str
    location: dict

# ===== Sortie =====
class PriorityResponse(BaseModel):
    image_id: str
    score: int
    priorite: str
    rank: int
    action: str
    location: dict

# ===== Règles métier =====
def compute_rank(score: int):
    if score >= 150:
        return 1, "Intervention immédiate"
    elif score >= 100:
        return 2, "Intervention rapide"
    elif score >= 60:
        return 3, "À planifier"
    else:
        return 4, "Surveillance"

@app.get("/health")
def health():
    return {"status": "prioritisation running"}

@app.post("/prioritise", response_model=PriorityResponse)
def prioritise(data: PriorityRequest):
    rank, action = compute_rank(data.score)

    return {
        "image_id": data.image_id,
        "score": data.score,
        "priorite": data.priorite,
        "rank": rank,
        "action": action,
        "location": data.location
    }
