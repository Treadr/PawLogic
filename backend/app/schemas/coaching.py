import uuid
from datetime import datetime

from pydantic import BaseModel


class CoachingMessageResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    role: str
    content: str
    model: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class CoachingSessionResponse(BaseModel):
    id: uuid.UUID
    pet_id: uuid.UUID
    title: str
    message_count: int
    created_at: datetime
    updated_at: datetime


class CoachingSessionDetail(BaseModel):
    id: uuid.UUID
    pet_id: uuid.UUID
    title: str
    messages: list[CoachingMessageResponse]
    created_at: datetime
    updated_at: datetime
