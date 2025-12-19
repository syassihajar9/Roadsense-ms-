from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Damage
from app.routers.auth import verify_token

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/geojson")
def export_geojson(
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    return {"status": "ok"}
