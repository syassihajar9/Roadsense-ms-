# test_api.py
import requests
import base64
from PIL import Image
from io import BytesIO

# -------------------
# Configuration
# -------------------
API_URL = "http://localhost:5000/detect"
TEST_IMAGE = "test_image.jpg"  # Remplace par ton image de test

# -------------------
# Envoyer l'image à l'API
# -------------------
with open(TEST_IMAGE, "rb") as f:
    files = {"image": f}
    response = requests.post(API_URL, files=files)

# Vérifier la réponse
if response.status_code == 200:
    data = response.json()
    print(f"Nombre total de dommages détectés : {data['total_damages']}")
    print("Détails des dommages détectés :")
    for damage in data["damages"]:
        print(f"- Classe : {damage['class']}, BBox : {damage['bbox']}")

    # Afficher l'image annotée
    img_data = base64.b64decode(data["image_annotated"])
    img = Image.open(BytesIO(img_data))
    img.show()

else:
    print(f"Erreur {response.status_code} : {response.text}")
