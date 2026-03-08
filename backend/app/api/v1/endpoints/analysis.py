"""Analysis endpoints -- trigger pattern detection, AI coaching, and view results."""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, Response
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException, ValidationException
from app.core.security import ensure_db_user
from app.db.session import get_db
from app.models.abc_log import ABCLog
from app.models.coaching_session import CoachingMessage, CoachingSession
from app.models.pet import Pet
from app.schemas.coaching import (
    CoachingMessageResponse,
    CoachingSessionDetail,
    CoachingSessionResponse,
)
from app.services.ai_analysis import coaching_response
from app.services.pattern_detection import MIN_LOGS_FOR_PATTERNS, detect_patterns

router = APIRouter()


class CoachingRequest(BaseModel):
    pet_id: uuid.UUID
    question: str = Field(..., min_length=5, max_length=500)
    session_id: uuid.UUID | None = None


@router.post("/coaching")
async def ask_coaching(
    body: CoachingRequest,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Ask the AI behavior coach a question about your pet.

    Uses the pet's ABC log history and existing insights as context
    to provide personalized, ABA-grounded advice. Falls back to general
    tips if the Claude API key is not configured.

    If session_id is provided, resumes that session with conversation history.
    If null, creates a new session.
    """
    uid = uuid.UUID(user_id)
    session: CoachingSession | None = None
    conversation_history: list[dict] | None = None

    if body.session_id:
        # Load existing session
        result = await db.execute(
            select(CoachingSession)
            .options(selectinload(CoachingSession.messages))
            .where(CoachingSession.id == body.session_id, CoachingSession.user_id == uid)
        )
        session = result.scalar_one_or_none()
        if session is None:
            raise NotFoundException(f"Coaching session {body.session_id}")

        # Build conversation history from existing messages (cap at 20)
        history_msgs = session.messages[-20:]
        if history_msgs:
            conversation_history = [
                {"role": msg.role, "content": msg.content} for msg in history_msgs
            ]
    else:
        # Create new session
        title = body.question[:100].strip()
        session = CoachingSession(
            pet_id=body.pet_id,
            user_id=uid,
            title=title,
        )
        db.add(session)
        await db.flush()

    # Save user message
    user_msg = CoachingMessage(
        session_id=session.id,
        role="user",
        content=body.question,
    )
    db.add(user_msg)

    # Get AI response
    ai_result = await coaching_response(
        db, body.pet_id, uid, body.question, conversation_history=conversation_history
    )

    # Save assistant message
    assistant_msg = CoachingMessage(
        session_id=session.id,
        role="assistant",
        content=ai_result["response"],
        model=ai_result.get("model"),
    )
    db.add(assistant_msg)

    # Update session timestamp
    session.updated_at = datetime.now()

    await db.commit()

    return {
        **ai_result,
        "session_id": str(session.id),
    }


@router.get("/coaching/sessions", response_model=list[CoachingSessionResponse])
async def list_coaching_sessions(
    pet_id: uuid.UUID = Query(...),
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> list[CoachingSessionResponse]:
    """List coaching sessions for a pet, ordered by most recent first."""
    uid = uuid.UUID(user_id)

    result = await db.execute(
        select(
            CoachingSession.id,
            CoachingSession.pet_id,
            CoachingSession.title,
            func.count(CoachingMessage.id).label("message_count"),
            CoachingSession.created_at,
            CoachingSession.updated_at,
        )
        .outerjoin(CoachingMessage)
        .where(CoachingSession.pet_id == pet_id, CoachingSession.user_id == uid)
        .group_by(CoachingSession.id)
        .order_by(CoachingSession.updated_at.desc())
    )
    rows = result.all()

    return [
        CoachingSessionResponse(
            id=row.id,
            pet_id=row.pet_id,
            title=row.title,
            message_count=row.message_count,
            created_at=row.created_at,
            updated_at=row.updated_at,
        )
        for row in rows
    ]


@router.get("/coaching/sessions/{session_id}", response_model=CoachingSessionDetail)
async def get_coaching_session(
    session_id: uuid.UUID,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> CoachingSessionDetail:
    """Get a coaching session with all its messages."""
    uid = uuid.UUID(user_id)

    result = await db.execute(
        select(CoachingSession)
        .options(selectinload(CoachingSession.messages))
        .where(CoachingSession.id == session_id, CoachingSession.user_id == uid)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise NotFoundException(f"Coaching session {session_id}")

    return CoachingSessionDetail(
        id=session.id,
        pet_id=session.pet_id,
        title=session.title,
        messages=[
            CoachingMessageResponse(
                id=msg.id,
                session_id=msg.session_id,
                role=msg.role,
                content=msg.content,
                model=msg.model,
                created_at=msg.created_at,
            )
            for msg in session.messages
        ],
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


@router.delete("/coaching/sessions/{session_id}", status_code=204)
async def delete_coaching_session(
    session_id: uuid.UUID,
    user_id: str = Depends(ensure_db_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete a coaching session and all its messages."""
    uid = uuid.UUID(user_id)

    result = await db.execute(
        select(CoachingSession).where(
            CoachingSession.id == session_id, CoachingSession.user_id == uid
        )
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise NotFoundException(f"Coaching session {session_id}")

    await db.delete(session)
    await db.commit()

    return Response(status_code=204)


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
