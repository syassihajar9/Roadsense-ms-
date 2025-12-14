FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=/app/best.pt
ENV TMPDIR=/var/tmp
ENV PIP_NO_CACHE_DIR=1

# Dépendances système
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgl1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
