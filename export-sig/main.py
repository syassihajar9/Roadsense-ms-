from fastapi import FastAPI
from fastapi.responses import JSONResponse
import psycopg2
import json

app = FastAPI(title="Export SIG Service")


# =========================
# DB CONNECTION
# =========================
def connect_db():
    return psycopg2.connect(
        dbname="roadsense",
        user="roadsense",
        password="roadsense",
        host="roadsense-postgres",
        port="5432"
    )


# =========================
# HEALTH
# =========================
@app.get("/health")
def health():
    return {"status": "export-sig running"}


# =========================
# EXPORT GEOJSON
# =========================
@app.get("/export/geojson")
def export_geojson():
    conn = connect_db()
    cur = conn.cursor()

    # 🔴 CORRECTION ICI : image_id::text
    cur.execute("""
        SELECT image_id::text, ST_AsGeoJSON(geom)
        FROM georef;
    """)

    features = []

    for image_id, geom_json in cur.fetchall():
        features.append({
            "type": "Feature",
            "geometry": json.loads(geom_json),
            "properties": {
                "image_id": image_id
            }
        })

    cur.close()
    conn.close()

    return JSONResponse(
        content={
            "type": "FeatureCollection",
            "features": features
        }
    )
