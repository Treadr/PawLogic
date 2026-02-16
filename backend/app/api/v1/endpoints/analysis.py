"""Analysis endpoints -- trigger pattern detection and view results."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationException
from app.core.security import ensure_db_user
from app.db.session import get_db
from app.models.abc_log import ABCLog
from app.models.pet import Pet
from app.services.pattern_detection import MIN_LOGS_FOR_PATTERNS, detect_patterns

router = APIRouter()


@router.post("/detect-patterns")
async def run_pattern_detection(
    pet_id: uuid.UUID = Query(...),
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Trigger pattern detection for a pet. Requires minimum 10 ABC logs."""
    # Verify ownership
    result = await db.execute(
        select(Pet).where(Pet.id == pet_id, Pet.user_id == uuid.UUID(user_id))
    )
    if result.scalar_one_or_none() is None:
        from app.core.exceptions import NotFoundException
        raise NotFoundException(f"Pet {pet_id}")

    # Check log count
    count_result = await db.execute(
        select(func.count()).select_from(ABCLog).where(ABCLog.pet_id == pet_id)
    )
    log_count = count_result.scalar()
    if log_count < MIN_LOGS_FOR_PATTERNS:
        raise ValidationException(
            f"Need at least {MIN_LOGS_FOR_PATTERNS} ABC logs for pattern detection. "
            f"Currently have {log_count}."
        )

    patterns = await detect_patterns(db, pet_id, uuid.UUID(user_id))

    return {
        "pet_id": str(pet_id),
        "logs_analyzed": log_count,
        "patterns_found": len(patterns),
        "patterns": patterns,
    }
