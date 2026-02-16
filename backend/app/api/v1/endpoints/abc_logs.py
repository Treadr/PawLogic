"""ABC Log CRUD endpoints -- the core ABA logging engine."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ValidationException
from app.core.security import ensure_db_user
from app.core.taxonomy import (
    CONSEQUENCE_CATEGORIES,
    get_antecedent_categories,
    get_behavior_categories,
)
from app.db.session import get_db
from app.models.abc_log import ABCLog
from app.models.pet import Pet
from app.schemas.abc_log import ABCLogCreate, ABCLogResponse, ABCLogSummary, ABCLogUpdate

router = APIRouter()


async def _get_user_pet(db: AsyncSession, pet_id: uuid.UUID, user_id: str) -> Pet:
    """Fetch a pet owned by the given user, or raise 404."""
    result = await db.execute(
        select(Pet).where(Pet.id == pet_id, Pet.user_id == uuid.UUID(user_id))
    )
    pet = result.scalar_one_or_none()
    if pet is None:
        raise NotFoundException(f"Pet {pet_id}")
    return pet


def _validate_taxonomy(species: str, body: ABCLogCreate | ABCLogUpdate) -> None:
    """Validate that categories and tags match the ABA taxonomy."""
    antecedent_cats = get_antecedent_categories(species)
    behavior_cats = get_behavior_categories(species)
    consequence_cats = CONSEQUENCE_CATEGORIES

    if body.antecedent_category is not None and body.antecedent_category not in antecedent_cats:
        raise ValidationException(
            f"Invalid antecedent category '{body.antecedent_category}' for {species}"
        )
    if body.antecedent_tags is not None and body.antecedent_category is not None:
        valid_tags = set(antecedent_cats.get(body.antecedent_category, []))
        invalid = [t for t in body.antecedent_tags if t not in valid_tags]
        if invalid:
            raise ValidationException(
                f"Invalid antecedent tags for '{body.antecedent_category}': {invalid}"
            )

    if body.behavior_category is not None and body.behavior_category not in behavior_cats:
        raise ValidationException(
            f"Invalid behavior category '{body.behavior_category}' for {species}"
        )
    if body.behavior_tags is not None and body.behavior_category is not None:
        valid_tags = set(behavior_cats.get(body.behavior_category, []))
        invalid = [t for t in body.behavior_tags if t not in valid_tags]
        if invalid:
            raise ValidationException(
                f"Invalid behavior tags for '{body.behavior_category}': {invalid}"
            )

    if body.consequence_category is not None and body.consequence_category not in consequence_cats:
        raise ValidationException(f"Invalid consequence category '{body.consequence_category}'")
    if body.consequence_tags is not None and body.consequence_category is not None:
        valid_tags = set(consequence_cats.get(body.consequence_category, []))
        invalid = [t for t in body.consequence_tags if t not in valid_tags]
        if invalid:
            raise ValidationException(
                f"Invalid consequence tags for '{body.consequence_category}': {invalid}"
            )


@router.post("", response_model=ABCLogResponse, status_code=201)
async def create_abc_log(
    body: ABCLogCreate,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> ABCLog:
    pet = await _get_user_pet(db, body.pet_id, user_id)
    _validate_taxonomy(pet.species, body)

    now = datetime.now(UTC)
    if body.occurred_at and body.occurred_at.replace(tzinfo=UTC) > now:
        raise ValidationException("occurred_at cannot be in the future")

    # Strip timezone for TIMESTAMP WITHOUT TIME ZONE column
    occurred = (
        body.occurred_at.replace(tzinfo=None) if body.occurred_at else now.replace(tzinfo=None)
    )

    log = ABCLog(
        pet_id=body.pet_id,
        user_id=uuid.UUID(user_id),
        antecedent_category=body.antecedent_category,
        antecedent_tags=body.antecedent_tags,
        antecedent_notes=body.antecedent_notes,
        behavior_category=body.behavior_category,
        behavior_tags=body.behavior_tags,
        behavior_severity=body.behavior_severity,
        behavior_notes=body.behavior_notes,
        consequence_category=body.consequence_category,
        consequence_tags=body.consequence_tags,
        consequence_notes=body.consequence_notes,
        occurred_at=occurred,
        location=body.location,
        duration_seconds=body.duration_seconds,
        other_pets_present=body.other_pets_present,
    )
    db.add(log)
    await db.flush()
    await db.refresh(log)
    return log


@router.get("", response_model=list[ABCLogResponse])
async def list_abc_logs(
    pet_id: uuid.UUID = Query(...),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> list[ABCLog]:
    await _get_user_pet(db, pet_id, user_id)
    result = await db.execute(
        select(ABCLog)
        .where(ABCLog.pet_id == pet_id)
        .order_by(ABCLog.occurred_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


@router.get("/summary", response_model=ABCLogSummary)
async def abc_log_summary(
    pet_id: uuid.UUID = Query(...),
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await _get_user_pet(db, pet_id, user_id)

    # Aggregate stats
    stats = await db.execute(
        select(
            func.count().label("total"),
            func.min(ABCLog.occurred_at).label("earliest"),
            func.max(ABCLog.occurred_at).label("latest"),
            func.avg(ABCLog.behavior_severity).label("severity_avg"),
        ).where(ABCLog.pet_id == pet_id)
    )
    row = stats.one()

    # Top behavior categories
    top_behaviors_q = await db.execute(
        select(
            ABCLog.behavior_category,
            func.count().label("count"),
        )
        .where(ABCLog.pet_id == pet_id)
        .group_by(ABCLog.behavior_category)
        .order_by(func.count().desc())
        .limit(5)
    )
    top_behaviors = [
        {"category": r.behavior_category, "count": r.count} for r in top_behaviors_q.all()
    ]

    # Top antecedent categories
    top_antecedents_q = await db.execute(
        select(
            ABCLog.antecedent_category,
            func.count().label("count"),
        )
        .where(ABCLog.pet_id == pet_id)
        .group_by(ABCLog.antecedent_category)
        .order_by(func.count().desc())
        .limit(5)
    )
    top_antecedents = [
        {"category": r.antecedent_category, "count": r.count} for r in top_antecedents_q.all()
    ]

    return {
        "total_logs": row.total,
        "earliest_log": row.earliest,
        "latest_log": row.latest,
        "severity_avg": float(row.severity_avg) if row.severity_avg else None,
        "top_behaviors": top_behaviors,
        "top_antecedents": top_antecedents,
    }


@router.get("/{log_id}", response_model=ABCLogResponse)
async def get_abc_log(
    log_id: uuid.UUID,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> ABCLog:
    result = await db.execute(
        select(ABCLog).where(ABCLog.id == log_id, ABCLog.user_id == uuid.UUID(user_id))
    )
    log = result.scalar_one_or_none()
    if log is None:
        raise NotFoundException(f"ABC log {log_id}")
    return log


@router.put("/{log_id}", response_model=ABCLogResponse)
async def update_abc_log(
    log_id: uuid.UUID,
    body: ABCLogUpdate,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> ABCLog:
    result = await db.execute(
        select(ABCLog).where(ABCLog.id == log_id, ABCLog.user_id == uuid.UUID(user_id))
    )
    log = result.scalar_one_or_none()
    if log is None:
        raise NotFoundException(f"ABC log {log_id}")

    # Get the pet's species for taxonomy validation
    pet_result = await db.execute(select(Pet).where(Pet.id == log.pet_id))
    pet = pet_result.scalar_one()
    _validate_taxonomy(pet.species, body)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(log, field, value)
    await db.flush()
    await db.refresh(log)
    return log


@router.delete("/{log_id}", status_code=204)
async def delete_abc_log(
    log_id: uuid.UUID,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(ABCLog).where(ABCLog.id == log_id, ABCLog.user_id == uuid.UUID(user_id))
    )
    log = result.scalar_one_or_none()
    if log is None:
        raise NotFoundException(f"ABC log {log_id}")
    await db.delete(log)


@router.get("/taxonomy/{species}")
async def get_taxonomy(species: str) -> dict:
    """Return the full ABA taxonomy for a species (public, no auth required)."""
    if species not in ("cat", "dog"):
        raise ValidationException("Species must be 'cat' or 'dog'")
    return {
        "species": species,
        "antecedent_categories": get_antecedent_categories(species),
        "behavior_categories": get_behavior_categories(species),
        "consequence_categories": CONSEQUENCE_CATEGORIES,
    }
