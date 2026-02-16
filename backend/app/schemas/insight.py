import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class InsightResponse(BaseModel):
    id: uuid.UUID
    pet_id: uuid.UUID
    user_id: uuid.UUID
    insight_type: str
    title: str
    body: str
    confidence: Decimal | None
    abc_log_ids: list[uuid.UUID] | None
    behavior_function: str | None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class InsightMarkRead(BaseModel):
    is_read: bool = True
