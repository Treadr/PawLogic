"""Background tasks for AI analysis and notifications."""

import asyncio
import logging
import uuid

from app.workers.celery_app import celery_app

logger = logging.getLogger("pawlogic.worker")


@celery_app.task(name="pawlogic.analyze_patterns")
def analyze_patterns(pet_id: str, user_id: str) -> dict:
    """Run pattern detection for a pet in the background.

    This is the async-to-sync bridge for Celery. It creates a new
    event loop, runs the async pattern detection, and returns results.
    """
    from app.db.session import async_session_factory
    from app.services.pattern_detection import detect_patterns

    async def _run():
        async with async_session_factory() as session:
            return await detect_patterns(session, uuid.UUID(pet_id), uuid.UUID(user_id))

    loop = asyncio.new_event_loop()
    try:
        patterns = loop.run_until_complete(_run())
        logger.info(
            "Pattern detection complete for pet %s: %d patterns found",
            pet_id,
            len(patterns),
        )
        return {
            "pet_id": pet_id,
            "patterns_found": len(patterns),
            "patterns": patterns,
        }
    finally:
        loop.close()


@celery_app.task(name="pawlogic.generate_bip")
def generate_bip(pet_id: str, user_id: str) -> dict:
    """Generate a Behavior Intervention Plan using Claude AI.

    Stub for Phase 2. Will call Anthropic Claude API to generate
    species-appropriate BIPs based on accumulated ABC logs and insights.
    """
    logger.info("BIP generation requested for pet %s (stub)", pet_id)
    return {
        "pet_id": pet_id,
        "status": "not_implemented",
        "message": "BIP generation will be available in Phase 2",
    }


@celery_app.task(name="pawlogic.send_notification")
def send_notification(user_id: str, title: str, body: str) -> dict:
    """Send a push notification to a user.

    Stub for Phase 2. Will integrate with Expo Notifications / OneSignal.
    """
    logger.info("Notification for user %s: %s (stub)", user_id, title)
    return {
        "user_id": user_id,
        "status": "not_implemented",
        "message": "Push notifications will be available in Phase 2",
    }
