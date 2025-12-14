from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os

app = FastAPI()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class Detection(BaseModel):
    image_id: str
    class_id: int
    confidence: float
    bbox: list

@app.get("/health")
def health():
    return {"status": "score-ia running"}

@app.post("/score_ai")
def compute_score_ai(data: Detection):

    prompt = f"""
    Tu es un expert en évaluation de fissures routières.
    Analyse ces données techniques :
    - image_id : {data.image_id}
    - classe fissure YOLO : {data.class_id}
    - confiance : {data.confidence}
    - bounding box : {data.bbox}

    Détermine :
    1. un score de gravité entre 0 et 100
    2. un niveau : faible / moyen / élevé
    3. un commentaire technique concis

    Répond STRICTEMENT en JSON :
    {{
      "score": NUMBER,
      "niveau": "faible|moyen|élevé",
      "commentaire": "..."
    }}
    """

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}]
        }
    )

    return response.json()["choices"][0]["message"]["content"]
