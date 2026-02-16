"""Pet CRUD endpoints."""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.core.security import ensure_db_user
from app.db.session import get_db
from app.models.pet import Pet
from app.schemas.pet import PetCreate, PetResponse, PetUpdate

router = APIRouter()


@router.post("", response_model=PetResponse, status_code=201)
async def create_pet(
    body: PetCreate,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> Pet:
    pet = Pet(
        user_id=uuid.UUID(user_id),
        name=body.name,
        species=body.species,
        breed=body.breed,
        age_years=body.age_years,
        age_months=body.age_months,
        weight_lbs=body.weight_lbs,
        sex=body.sex,
        is_neutered=body.is_neutered,
        temperament=body.temperament,
        medical_notes=body.medical_notes,
    )
    db.add(pet)
    await db.flush()
    await db.refresh(pet)
    return pet


@router.get("", response_model=list[PetResponse])
async def list_pets(
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> list[Pet]:
    result = await db.execute(
        select(Pet).where(Pet.user_id == uuid.UUID(user_id)).order_by(Pet.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/{pet_id}", response_model=PetResponse)
async def get_pet(
    pet_id: uuid.UUID,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> Pet:
    pet = await _get_user_pet(db, pet_id, user_id)
    return pet


@router.put("/{pet_id}", response_model=PetResponse)
async def update_pet(
    pet_id: uuid.UUID,
    body: PetUpdate,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> Pet:
    pet = await _get_user_pet(db, pet_id, user_id)
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pet, field, value)
    await db.flush()
    await db.refresh(pet)
    return pet


@router.delete("/{pet_id}", status_code=204)
async def delete_pet(
    pet_id: uuid.UUID,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    pet = await _get_user_pet(db, pet_id, user_id)
    await db.delete(pet)


async def _get_user_pet(db: AsyncSession, pet_id: uuid.UUID, user_id: str) -> Pet:
    """Fetch a pet owned by the given user, or raise 404."""
    result = await db.execute(
        select(Pet).where(Pet.id == pet_id, Pet.user_id == uuid.UUID(user_id))
    )
    pet = result.scalar_one_or_none()
    if pet is None:
        raise NotFoundException(f"Pet {pet_id}")
    return pet
