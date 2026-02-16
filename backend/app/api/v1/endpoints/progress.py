"""Progress and stats endpoints for behavior trend visualization."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, cast, Date, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.core.security import ensure_db_user
from app.db.session import get_db
from app.models.abc_log import ABCLog
from app.models.pet import Pet

router = APIRouter()


async def _verify_pet_ownership(
    db: AsyncSession, pet_id: uuid.UUID, user_id: str
) -> None:
    result = await db.execute(
        select(Pet).where(Pet.id == pet_id, Pet.user_id == uuid.UUID(user_id))
    )
    if result.scalar_one_or_none() is None:
        raise NotFoundException(f"Pet {pet_id}")


@router.get("/frequency")
async def behavior_frequency(
    pet_id: uuid.UUID = Query(...),
    days: int = Query(30, ge=7, le=90),
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Daily behavior log counts for the past N days. Data for line/bar charts."""
    await _verify_pet_ownership(db, pet_id, user_id)
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=days)
    result = await db.execute(
        select(
            cast(ABCLog.occurred_at, Date).label("date"),
            func.count().label("count"),
        )
        .where(ABCLog.pet_id == pet_id, ABCLog.occurred_at >= cutoff)
        .group_by(cast(ABCLog.occurred_at, Date))
        .order_by(cast(ABCLog.occurred_at, Date))
    )
    data = [{"date": str(r.date), "count": r.count} for r in result.all()]
    return {"pet_id": str(pet_id), "days": days, "data": data}


@router.get("/severity-trend")
async def severity_trend(
    pet_id: uuid.UUID = Query(...),
    days: int = Query(30, ge=7, le=90),
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Daily average severity for the past N days. Data for line charts."""
    await _verify_pet_ownership(db, pet_id, user_id)
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=days)
    result = await db.execute(
        select(
            cast(ABCLog.occurred_at, Date).label("date"),
            func.avg(ABCLog.behavior_severity).label("avg_severity"),
            func.max(ABCLog.behavior_severity).label("max_severity"),
        )
        .where(ABCLog.pet_id == pet_id, ABCLog.occurred_at >= cutoff)
        .group_by(cast(ABCLog.occurred_at, Date))
        .order_by(cast(ABCLog.occurred_at, Date))
    )
    data = [
        {
            "date": str(r.date),
            "avg_severity": round(float(r.avg_severity), 1),
            "max_severity": r.max_severity,
        }
        for r in result.all()
    ]
    return {"pet_id": str(pet_id), "days": days, "data": data}


@router.get("/category-breakdown")
async def category_breakdown(
    pet_id: uuid.UUID = Query(...),
    days: int = Query(30, ge=7, le=90),
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Breakdown of behavior and antecedent categories. Data for pie/donut charts."""
    await _verify_pet_ownership(db, pet_id, user_id)
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=days)

    behaviors = await db.execute(
        select(
            ABCLog.behavior_category,
            func.count().label("count"),
        )
        .where(ABCLog.pet_id == pet_id, ABCLog.occurred_at >= cutoff)
        .group_by(ABCLog.behavior_category)
        .order_by(func.count().desc())
    )
    antecedents = await db.execute(
        select(
            ABCLog.antecedent_category,
            func.count().label("count"),
        )
        .where(ABCLog.pet_id == pet_id, ABCLog.occurred_at >= cutoff)
        .group_by(ABCLog.antecedent_category)
        .order_by(func.count().desc())
    )
    consequences = await db.execute(
        select(
            ABCLog.consequence_category,
            func.count().label("count"),
        )
        .where(ABCLog.pet_id == pet_id, ABCLog.occurred_at >= cutoff)
        .group_by(ABCLog.consequence_category)
        .order_by(func.count().desc())
    )

    return {
        "pet_id": str(pet_id),
        "days": days,
        "behaviors": [{"category": r.behavior_category, "count": r.count} for r in behaviors.all()],
        "antecedents": [{"category": r.antecedent_category, "count": r.count} for r in antecedents.all()],
        "consequences": [{"category": r.consequence_category, "count": r.count} for r in consequences.all()],
    }


@router.get("/dashboard")
async def pet_dashboard(
    pet_id: uuid.UUID = Query(...),
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Combined dashboard data: total logs, recent trend, top patterns."""
    await _verify_pet_ownership(db, pet_id, user_id)

    # Total logs
    total_result = await db.execute(
        select(func.count()).select_from(ABCLog).where(ABCLog.pet_id == pet_id)
    )
    total_logs = total_result.scalar()

    # Last 7 days vs previous 7 days (trend direction)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    recent = await db.execute(
        select(func.count()).select_from(ABCLog).where(
            ABCLog.pet_id == pet_id, ABCLog.occurred_at >= week_ago
        )
    )
    previous = await db.execute(
        select(func.count()).select_from(ABCLog).where(
            ABCLog.pet_id == pet_id,
            ABCLog.occurred_at >= two_weeks_ago,
            ABCLog.occurred_at < week_ago,
        )
    )
    recent_count = recent.scalar()
    previous_count = previous.scalar()

    if previous_count > 0:
        trend_pct = round(((recent_count - previous_count) / previous_count) * 100, 1)
    elif recent_count > 0:
        trend_pct = 100.0
    else:
        trend_pct = 0.0

    # Average severity
    avg_sev = await db.execute(
        select(func.avg(ABCLog.behavior_severity)).where(ABCLog.pet_id == pet_id)
    )

    # Pattern detection readiness
    pattern_ready = total_logs >= 10

    avg_val = avg_sev.scalar()
    return {
        "pet_id": str(pet_id),
        "total_logs": total_logs,
        "recent_7d": recent_count,
        "previous_7d": previous_count,
        "trend_pct": trend_pct,
        "avg_severity": round(float(avg_val), 1) if avg_val else None,
        "pattern_detection_ready": pattern_ready,
    }
