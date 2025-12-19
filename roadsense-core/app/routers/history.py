from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Damage
from app.schemas import DamageOut
from app.deps import get_current_user
from typing import List

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[DamageOut])
def get_history(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(Damage).all()
