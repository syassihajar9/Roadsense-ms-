from fastapi import FastAPI
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="Georef Microservice")

# ==============================
# DATABASE CONFIG (Docker)
# ==============================
DB_CONFIG = {
    "host": "roadsense-postgres",
    "dbname": "roadsense",
    "user": "roadsense",
    "password": "roadsense",
    "port": 5432,
}

def get_db():
    return psycopg2.connect(**DB_CONFIG)

# ==============================
# HEALTH
# ==============================
@app.get("/")
def root():
    return {"message": "Georef microservice OK"}

@app.get("/health")
def health():
    return {"status": "georef running"}

# ==============================
# DATA MODEL
# ==============================
class GeoRequest(BaseModel):
    image_id: str
    lon: float
    lat: float
    score: float | None = None
    priorite: str | None = None

# ==============================
# INSERT DAMAGE
# ==============================
@app.post("/georef")
def georef(data: GeoRequest):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO damages (image_id, score, priorite, geom)
        VALUES (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
        RETURNING id
        """,
        (
            data.image_id,
            data.score,
            data.priorite,
            data.lon,
            data.lat,
        )
    )

    damage_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "status": "saved",
        "id": damage_id,
        "image_id": data.image_id,
        "latitude": data.lat,
        "longitude": data.lon,
    }

# ==============================
# GET ALL DAMAGES (CARTE)
# ==============================
@app.get("/damages")
def get_all_damages():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(
        """
        SELECT
            id,
            image_id,
            score,
            priorite,
            ST_Y(geom) AS latitude,
            ST_X(geom) AS longitude,
            created_at
        FROM damages
        ORDER BY created_at DESC
        """
    )

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {
        "count": len(rows),
        "damages": rows
    }
