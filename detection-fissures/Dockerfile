FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=/app/best.pt
ENV TMPDIR=/var/tmp
ENV PIP_NO_CACHE_DIR=1

# Dépendances système pour OpenCV / Torch
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgl1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Installer les dépendances Python
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier le code et le modèle
COPY app.py .
COPY best.pt .

RUN mkdir -p uploads results

EXPOSE 8000

# FastAPI + Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
