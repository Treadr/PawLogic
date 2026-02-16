"""Insight endpoints -- list, get, mark as read."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.core.security import ensure_db_user
from app.db.session import get_db
from app.models.insight import Insight
from app.models.pet import Pet
from app.schemas.insight import InsightMarkRead, InsightResponse

router = APIRouter()


async def _verify_pet_ownership(
    db: AsyncSession, pet_id: uuid.UUID, user_id: str
) -> None:
    result = await db.execute(
        select(Pet).where(Pet.id == pet_id, Pet.user_id == uuid.UUID(user_id))
    )
    if result.scalar_one_or_none() is None:
        raise NotFoundException(f"Pet {pet_id}")


@router.get("/pets/{pet_id}/insights", response_model=list[InsightResponse])
async def list_insights(
    pet_id: uuid.UUID,
    unread_only: bool = Query(False),
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> list[Insight]:
    await _verify_pet_ownership(db, pet_id, user_id)
    query = select(Insight).where(Insight.pet_id == pet_id)
    if unread_only:
        query = query.where(Insight.is_read == False)
    query = query.order_by(Insight.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/pets/{pet_id}/insights/summary")
async def insights_summary(
    pet_id: uuid.UUID,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await _verify_pet_ownership(db, pet_id, user_id)
    total = await db.execute(
        select(func.count()).select_from(Insight).where(Insight.pet_id == pet_id)
    )
    unread = await db.execute(
        select(func.count()).select_from(Insight).where(
            Insight.pet_id == pet_id, Insight.is_read == False
        )
    )
    return {"total": total.scalar(), "unread": unread.scalar()}


@router.get("/insights/{insight_id}", response_model=InsightResponse)
async def get_insight(
    insight_id: uuid.UUID,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> Insight:
    result = await db.execute(
        select(Insight).where(
            Insight.id == insight_id, Insight.user_id == uuid.UUID(user_id)
        )
    )
    insight = result.scalar_one_or_none()
    if insight is None:
        raise NotFoundException(f"Insight {insight_id}")
    return insight


@router.patch("/insights/{insight_id}", response_model=InsightResponse)
async def mark_insight_read(
    insight_id: uuid.UUID,
    body: InsightMarkRead,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> Insight:
    result = await db.execute(
        select(Insight).where(
            Insight.id == insight_id, Insight.user_id == uuid.UUID(user_id)
        )
    )
    insight = result.scalar_one_or_none()
    if insight is None:
        raise NotFoundException(f"Insight {insight_id}")
    insight.is_read = body.is_read
    await db.flush()
    await db.refresh(insight)
    return insight
