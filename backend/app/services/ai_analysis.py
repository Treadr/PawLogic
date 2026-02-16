"""AI-powered behavior analysis service using Anthropic Claude.

Provides conversational coaching, enhanced insight generation, and
BIP (Behavior Intervention Plan) foundations.
"""

import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.abc_log import ABCLog
from app.models.insight import Insight
from app.models.pet import Pet

logger = logging.getLogger("pawlogic.ai")

SYSTEM_PROMPT = """You are PawLogic's behavior coach — a knowledgeable, friendly expert in Applied Behavior Analysis (ABA) for pets. You provide science-backed advice in plain English.

Key principles:
- Use ABA terminology internally but explain everything in plain English
- Never recommend punishment-based interventions
- Focus on positive reinforcement, antecedent modification, and replacement behaviors
- Be species-appropriate (cats and dogs have different needs)
- Be warm, encouraging, and practical
- When uncertain, say so and recommend consulting a veterinarian or certified animal behaviorist

Behavior function framework (ABA):
- Attention: behavior maintained by social attention (positive or negative)
- Escape: behavior maintained by avoiding/removing something unpleasant
- Tangible: behavior maintained by gaining access to desired item/activity
- Sensory: behavior that is self-reinforcing through physical sensation"""


def _format_log_summary(logs: list[ABCLog]) -> str:
    """Format recent ABC logs into a concise context block for the AI."""
    if not logs:
        return "No behavior logs recorded yet."

    lines = [f"Recent ABC logs ({len(logs)} entries):"]
    for log in logs[:20]:  # Cap at 20 most recent
        lines.append(
            f"- [{log.occurred_at.strftime('%m/%d')}] "
            f"A: {log.antecedent_category} ({', '.join(log.antecedent_tags)}) | "
            f"B: {log.behavior_category} ({', '.join(log.behavior_tags)}, severity {log.behavior_severity}/5) | "
            f"C: {log.consequence_category} ({', '.join(log.consequence_tags)})"
        )
    return "\n".join(lines)


def _format_insights(insights: list[Insight]) -> str:
    """Format existing insights into context for the AI."""
    if not insights:
        return "No insights generated yet."

    lines = ["Existing pattern insights:"]
    for ins in insights[:10]:
        fn_label = f" [Function: {ins.behavior_function}]" if ins.behavior_function else ""
        lines.append(f"- {ins.title}{fn_label}")
    return "\n".join(lines)


async def coaching_response(
    db: AsyncSession,
    pet_id: uuid.UUID,
    user_id: uuid.UUID,
    question: str,
) -> dict:
    """Generate an AI coaching response about a pet's behavior.

    Uses the pet's ABC log history and existing insights as context.
    Falls back to a helpful message if Claude API is not configured.
    """
    # Fetch pet info
    pet_result = await db.execute(
        select(Pet).where(Pet.id == pet_id, Pet.user_id == user_id)
    )
    pet = pet_result.scalar_one_or_none()
    if pet is None:
        from app.core.exceptions import NotFoundException
        raise NotFoundException(f"Pet {pet_id}")

    # Fetch recent logs
    logs_result = await db.execute(
        select(ABCLog)
        .where(ABCLog.pet_id == pet_id)
        .order_by(ABCLog.occurred_at.desc())
        .limit(20)
    )
    logs = list(logs_result.scalars().all())

    # Fetch existing insights
    insights_result = await db.execute(
        select(Insight)
        .where(Insight.pet_id == pet_id)
        .order_by(Insight.created_at.desc())
        .limit(10)
    )
    insights = list(insights_result.scalars().all())

    # Build context
    pet_context = (
        f"Pet: {pet.name} ({pet.species}, {pet.breed or 'unknown breed'}, "
        f"age {pet.age_years or 'unknown'}y, {pet.sex})"
    )
    log_context = _format_log_summary(logs)
    insight_context = _format_insights(insights)

    user_message = (
        f"{pet_context}\n\n{log_context}\n\n{insight_context}\n\n"
        f"Owner's question: {question}"
    )

    # Check if Claude API is configured
    if not settings.ANTHROPIC_API_KEY:
        logger.warning("ANTHROPIC_API_KEY not set, returning fallback coaching response")
        return {
            "pet_id": str(pet_id),
            "question": question,
            "response": _fallback_response(pet, question, logs),
            "model": "fallback",
            "log_count": len(logs),
        }

    # Call Claude API
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=800,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
        response_text = message.content[0].text

        return {
            "pet_id": str(pet_id),
            "question": question,
            "response": response_text,
            "model": message.model,
            "log_count": len(logs),
        }
    except Exception as exc:
        logger.error("Claude API error: %s", exc)
        return {
            "pet_id": str(pet_id),
            "question": question,
            "response": _fallback_response(pet, question, logs),
            "model": "fallback",
            "log_count": len(logs),
            "error": str(exc),
        }


def _fallback_response(pet: Pet, question: str, logs: list[ABCLog]) -> str:
    """Generate a basic response when Claude API is unavailable."""
    species = pet.species
    name = pet.name
    log_count = len(logs)

    base = (
        f"Thanks for asking about {name}'s behavior! "
        f"While the AI coaching feature requires an API key to be configured, "
        f"here are some general tips:\n\n"
    )

    if log_count < 10:
        base += (
            f"You currently have {log_count} behavior logs for {name}. "
            f"Keep logging! Once you reach 10 logs, pattern detection will "
            f"automatically identify trends and triggers.\n\n"
        )

    if species == "cat":
        base += (
            "General cat behavior tips:\n"
            "- Cats need environmental enrichment: vertical spaces, scratching posts, "
            "and window perches\n"
            "- Avoid punishment - it increases stress and can worsen behavior\n"
            "- Multiple litter boxes (n+1 rule) can help with elimination issues\n"
            "- Changes in routine or environment are common triggers for behavioral changes\n"
        )
    else:
        base += (
            "General dog behavior tips:\n"
            "- Exercise and mental stimulation prevent many behavior issues\n"
            "- Positive reinforcement (treats, praise) is more effective than punishment\n"
            "- Consistency in training across all family members is key\n"
            "- If anxiety-related, consider gradual desensitization techniques\n"
        )

    base += (
        "\nFor personalized AI coaching, configure the ANTHROPIC_API_KEY in your "
        "environment settings."
    )
    return base
