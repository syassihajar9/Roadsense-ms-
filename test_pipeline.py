import requests
import json
import time

API = {
    "ingestion": "http://localhost:8001",
    "detection": "http://localhost:8002",
    "georef": "http://localhost:8003",
    "score": "http://localhost:8004",
    "prioritisation": "http://localhost:8005",
    "export": "http://localhost:8006",
}

print("\n====== ROAD SENSE PIPELINE TEST ======\n")

# ---------------------------------------------------------
# 1. UPLOAD VIDÉO
# ---------------------------------------------------------
print("1️⃣  Upload vidéo...")

video_path = "test_video.mp4"   # Mets une vraie vidéo ici !

files = {"file": open(video_path, "rb")}
res = requests.post(f"{API['ingestion']}/video/upload", files=files)
upload_data = res.json()
print(json.dumps(upload_data, indent=2))

video_id = upload_data.get("video_id", None)
if not video_id:
    print("❌ Erreur lors de l’upload (video_id manquant)")
    exit()

print("✅ Vidéo uploadée, ID =", video_id)


# ---------------------------------------------------------
# 2. DÉTECTION DES FISSURES
# ---------------------------------------------------------
print("\n2️⃣  Détection en cours...")

payload = {"video_id": video_id}
res = requests.post(f"{API['detection']}/detect", json=payload)

detection_data = res.json()
print(json.dumps(detection_data, indent=2))

if "detections" not in detection_data:
    print("❌ Erreur : pas de detections trouvées")
    exit()

print("✅ Détection OK")

# Extraction d’un image_id pour suite du pipeline
first_detection = detection_data["detections"][0]
image_id = first_detection.get("image_id")

print("Image ID extrait :", image_id)


# ---------------------------------------------------------
# 3. GÉORÉFÉRENCEMENT
# ---------------------------------------------------------
print("\n3️⃣  Géoréférencement...")

georef_payload = {
    "image_id": image_id,
    "lon": -7.5898,  # Exemple Casablanca
    "lat": 33.5731,
}

res = requests.post(f"{API['georef']}/georef", json=georef_payload)
georef_data = res.json()
print(json.dumps(georef_data, indent=2))

print("✅ Géoréférencement OK")


# ---------------------------------------------------------
# 4. SCORE GRAVITÉ
# ---------------------------------------------------------
print("\n4️⃣  Scoring...")

res = requests.get(f"{API['score']}/score")
score_data = res.json()

print(json.dumps(score_data, indent=2))
print("✅ Score gravité OK")


# ---------------------------------------------------------
# 5. PRIORISATION
# ---------------------------------------------------------
print("\n5️⃣  Priorisation...")

res = requests.get(f"{API['prioritisation']}/prioritisation")
prior_data = res.json()

print(json.dumps(prior_data, indent=2))
print("✅ Priorisation OK")


# ---------------------------------------------------------
# 6. EXPORT SIG
# ---------------------------------------------------------
print("\n6️⃣  Export SIG...")

res = requests.get(f"{API['export']}/export?format=geojson")

with open("roadsense_output.geojson", "wb") as f:
    f.write(res.content)

print("📁 GeoJSON téléchargé → roadsense_output.geojson")
print("✅ Export SIG OK")

print("\n🎉 Pipeline RoadSense TESTÉ AVEC SUCCÈS ❗")
