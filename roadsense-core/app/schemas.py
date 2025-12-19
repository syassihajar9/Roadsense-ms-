from pydantic import BaseModel
from datetime import datetime

class DamageBase(BaseModel):
    image_id: str | None = None
    damage_type: str
    confidence: float
    severity: int
    priority: str
    latitude: float
    longitude: float


class DamageOut(DamageBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
