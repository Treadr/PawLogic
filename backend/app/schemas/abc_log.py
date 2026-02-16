"""Pydantic schemas for ABC log endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ABCLogCreate(BaseModel):
    pet_id: uuid.UUID
    antecedent_category: str = Field(..., max_length=50)
    antecedent_tags: list[str] = Field(..., min_length=1)
    antecedent_notes: str | None = None
    behavior_category: str = Field(..., max_length=50)
    behavior_tags: list[str] = Field(..., min_length=1)
    behavior_severity: int = Field(..., ge=1, le=5)
    behavior_notes: str | None = None
    consequence_category: str = Field(..., max_length=50)
    consequence_tags: list[str] = Field(..., min_length=1)
    consequence_notes: str | None = None
    occurred_at: datetime | None = None
    location: str | None = Field(None, max_length=100)
    duration_seconds: int | None = Field(None, ge=0)
    other_pets_present: list[uuid.UUID] | None = None


class ABCLogUpdate(BaseModel):
    antecedent_category: str | None = Field(None, max_length=50)
    antecedent_tags: list[str] | None = Field(None, min_length=1)
    antecedent_notes: str | None = None
    behavior_category: str | None = Field(None, max_length=50)
    behavior_tags: list[str] | None = Field(None, min_length=1)
    behavior_severity: int | None = Field(None, ge=1, le=5)
    behavior_notes: str | None = None
    consequence_category: str | None = Field(None, max_length=50)
    consequence_tags: list[str] | None = Field(None, min_length=1)
    consequence_notes: str | None = None
    occurred_at: datetime | None = None
    location: str | None = Field(None, max_length=100)
    duration_seconds: int | None = Field(None, ge=0)
    other_pets_present: list[uuid.UUID] | None = None


class ABCLogResponse(BaseModel):
    id: uuid.UUID
    pet_id: uuid.UUID
    user_id: uuid.UUID
    antecedent_category: str
    antecedent_tags: list[str]
    antecedent_notes: str | None
    behavior_category: str
    behavior_tags: list[str]
    behavior_severity: int
    behavior_notes: str | None
    consequence_category: str
    consequence_tags: list[str]
    consequence_notes: str | None
    occurred_at: datetime
    location: str | None
    duration_seconds: int | None
    other_pets_present: list[uuid.UUID] | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ABCLogSummary(BaseModel):
    total_logs: int
    earliest_log: datetime | None
    latest_log: datetime | None
    severity_avg: float | None
    top_behaviors: list[dict]
    top_antecedents: list[dict]
