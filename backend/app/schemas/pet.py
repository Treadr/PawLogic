import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class PetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    species: str = Field(..., pattern="^(cat|dog)$")
    breed: str | None = Field(None, max_length=100)
    age_years: int | None = Field(None, ge=0, le=30)
    age_months: int | None = Field(None, ge=0, le=11)
    weight_lbs: float | None = Field(None, gt=0, le=300)
    sex: str = Field("unknown", pattern="^(male|female|unknown)$")
    is_neutered: bool = False
    temperament: list[str] | None = None
    medical_notes: str | None = None


class PetUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    breed: str | None = Field(None, max_length=100)
    age_years: int | None = Field(None, ge=0, le=30)
    age_months: int | None = Field(None, ge=0, le=11)
    weight_lbs: float | None = Field(None, gt=0, le=300)
    sex: str | None = Field(None, pattern="^(male|female|unknown)$")
    is_neutered: bool | None = None
    temperament: list[str] | None = None
    medical_notes: str | None = None
    photo_url: str | None = Field(None, max_length=500)


class PetResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    species: str
    breed: str | None
    age_years: int | None
    age_months: int | None
    weight_lbs: float | None
    sex: str
    is_neutered: bool
    temperament: list[str] | None
    medical_notes: str | None
    photo_url: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
