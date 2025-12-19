from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth, history, export
import time

app = FastAPI(title="RoadSense Core API")

@app.on_event("startup")
def startup_event():
    retries = 10
    while retries > 0:
        try:
            Base.metadata.create_all(bind=engine)
            break
        except:
            retries -= 1
            time.sleep(3)

# ❌ PAS DE prefix ICI
app.include_router(auth.router)
app.include_router(history.router)
app.include_router(export.router)
