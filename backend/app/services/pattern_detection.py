"""Pattern detection engine for ABC log analysis.

Identifies behavioral patterns from accumulated ABC logs using ABA principles.
Requires minimum 10 logs before activation. Generates Insight records.
"""

import uuid
from collections import Counter
from datetime import datetime
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.taxonomy import BEHAVIOR_FUNCTIONS, SEVERITY_LABELS
from app.models.abc_log import ABCLog
from app.models.insight import Insight

MIN_LOGS_FOR_PATTERNS = 10
MIN_PAIR_FREQUENCY = 3  # Minimum A-B or B-C pair occurrences to flag as pattern
CONFIDENCE_THRESHOLDS = {
    "high": 0.7,
    "medium": 0.5,
    "low": 0.3,
}


async def detect_patterns(
    db: AsyncSession,
    pet_id: uuid.UUID,
    user_id: uuid.UUID,
) -> list[dict]:
    """Run pattern detection on a pet's ABC logs and create insight records.

    Returns a list of detected patterns (dicts with type, title, body, confidence).
    """
    # Fetch all logs for this pet
    result = await db.execute(
        select(ABCLog)
        .where(ABCLog.pet_id == pet_id)
        .order_by(ABCLog.occurred_at.asc())
    )
    logs = list(result.scalars().all())

    if len(logs) < MIN_LOGS_FOR_PATTERNS:
        return []

    insights_data: list[dict] = []

    # 1. Antecedent-Behavior pair detection
    ab_pairs = _detect_ab_pairs(logs)
    insights_data.extend(ab_pairs)

    # 2. Behavior-Consequence pair detection
    bc_pairs = _detect_bc_pairs(logs)
    insights_data.extend(bc_pairs)

    # 3. Behavior function assessment
    function_assessments = _assess_behavior_functions(logs)
    insights_data.extend(function_assessments)

    # 4. Severity trend detection
    severity_insights = _detect_severity_trends(logs)
    insights_data.extend(severity_insights)

    # Create Insight records for new patterns
    created = []
    for data in insights_data:
        # Check if a similar insight already exists
        existing = await db.execute(
            select(Insight).where(
                Insight.pet_id == pet_id,
                Insight.insight_type == data["insight_type"],
                Insight.title == data["title"],
            )
        )
        if existing.scalar_one_or_none() is not None:
            continue

        insight = Insight(
            pet_id=pet_id,
            user_id=user_id,
            insight_type=data["insight_type"],
            title=data["title"],
            body=data["body"],
            confidence=Decimal(str(round(data["confidence"], 2))),
            abc_log_ids=data.get("abc_log_ids"),
            behavior_function=data.get("behavior_function"),
        )
        db.add(insight)
        created.append(data)

    if created:
        await db.flush()

    return created


def _detect_ab_pairs(logs: list[ABCLog]) -> list[dict]:
    """Detect frequent Antecedent → Behavior pairs."""
    pairs: Counter[tuple[str, str]] = Counter()
    pair_logs: dict[tuple[str, str], list[uuid.UUID]] = {}

    for log in logs:
        key = (log.antecedent_category, log.behavior_category)
        pairs[key] += 1
        pair_logs.setdefault(key, []).append(log.id)

    total = len(logs)
    results = []
    for (ant, beh), count in pairs.most_common():
        if count < MIN_PAIR_FREQUENCY:
            continue
        confidence = count / total
        results.append({
            "insight_type": "pattern",
            "title": f"Pattern: {_humanize(ant)} triggers {_humanize(beh)}",
            "body": (
                f"We've noticed that when there's a {_humanize(ant)} event, "
                f"your pet tends to show {_humanize(beh)} behavior. "
                f"This happened {count} out of {total} logged incidents "
                f"({round(confidence * 100)}% of the time)."
            ),
            "confidence": confidence,
            "abc_log_ids": pair_logs[ant, beh][:10],
        })

    return results


def _detect_bc_pairs(logs: list[ABCLog]) -> list[dict]:
    """Detect frequent Behavior → Consequence pairs."""
    pairs: Counter[tuple[str, str]] = Counter()
    pair_logs: dict[tuple[str, str], list[uuid.UUID]] = {}

    for log in logs:
        key = (log.behavior_category, log.consequence_category)
        pairs[key] += 1
        pair_logs.setdefault(key, []).append(log.id)

    total = len(logs)
    results = []
    for (beh, con), count in pairs.most_common():
        if count < MIN_PAIR_FREQUENCY:
            continue
        confidence = count / total
        results.append({
            "insight_type": "correlation",
            "title": f"Response pattern: {_humanize(beh)} leads to {_humanize(con)}",
            "body": (
                f"After {_humanize(beh)} behavior, the most common response "
                f"has been {_humanize(con)}. This happened {count} times. "
                f"Understanding this pattern helps us see what might be "
                f"reinforcing the behavior."
            ),
            "confidence": confidence,
            "abc_log_ids": pair_logs[beh, con][:10],
        })

    return results


def _assess_behavior_functions(logs: list[ABCLog]) -> list[dict]:
    """Assess likely behavior function based on A-B-C patterns."""
    # Map consequence categories to likely behavior functions
    function_signals: dict[str, str] = {
        "attention_given": "attention",
        "verbal_reaction": "attention",
        "attention_removed": "escape",
        "resource_provided": "tangible",
        "resource_removed": "escape",
        "environmental_change": "escape",
        "other_pet_reaction": "sensory",
    }

    # Count function signals per behavior category
    behavior_functions: dict[str, Counter[str]] = {}
    behavior_logs: dict[str, list[uuid.UUID]] = {}

    for log in logs:
        beh = log.behavior_category
        fn = function_signals.get(log.consequence_category)
        if fn:
            behavior_functions.setdefault(beh, Counter())[fn] += 1
            behavior_logs.setdefault(beh, []).append(log.id)

    results = []
    for beh, fn_counts in behavior_functions.items():
        total = sum(fn_counts.values())
        if total < MIN_PAIR_FREQUENCY:
            continue
        top_fn, top_count = fn_counts.most_common(1)[0]
        confidence = top_count / total

        if confidence < CONFIDENCE_THRESHOLDS["low"]:
            continue

        if top_fn not in BEHAVIOR_FUNCTIONS:
            continue

        level = (
            "likely" if confidence >= CONFIDENCE_THRESHOLDS["high"]
            else "possibly" if confidence >= CONFIDENCE_THRESHOLDS["medium"]
            else "might be"
        )

        results.append({
            "insight_type": "function",
            "title": f"Behavior function: {_humanize(beh)} is {level} {top_fn}-driven",
            "body": (
                f"Based on {total} logged incidents, your pet's {_humanize(beh)} "
                f"behavior {level} serves an {top_fn} function. "
                f"This means the behavior is {_function_explanation(top_fn)}. "
                f"This helps us recommend the right approach to address it."
            ),
            "confidence": confidence,
            "behavior_function": top_fn,
            "abc_log_ids": behavior_logs[beh][:10],
        })

    return results


def _detect_severity_trends(logs: list[ABCLog]) -> list[dict]:
    """Detect if severity is trending up or down."""
    if len(logs) < MIN_LOGS_FOR_PATTERNS:
        return []

    # Split into first half and second half
    mid = len(logs) // 2
    first_half = logs[:mid]
    second_half = logs[mid:]

    first_avg = sum(l.behavior_severity for l in first_half) / len(first_half)
    second_avg = sum(l.behavior_severity for l in second_half) / len(second_half)

    diff = second_avg - first_avg
    if abs(diff) < 0.5:
        return []

    direction = "increasing" if diff > 0 else "decreasing"
    confidence = min(abs(diff) / 2, 1.0)

    return [{
        "insight_type": "pattern",
        "title": f"Severity trend: behaviors are {direction}",
        "body": (
            f"Looking at your logs over time, behavior severity has been {direction}. "
            f"Average severity went from {round(first_avg, 1)} "
            f"({SEVERITY_LABELS.get(round(first_avg), 'N/A')}) "
            f"to {round(second_avg, 1)} "
            f"({SEVERITY_LABELS.get(round(second_avg), 'N/A')}). "
            f"{'This is encouraging progress!' if diff < 0 else 'This may need attention.'}"
        ),
        "confidence": confidence,
    }]


def _humanize(snake_str: str) -> str:
    """Convert snake_case to human-readable text."""
    return snake_str.replace("_", " ")


def _function_explanation(function: str) -> str:
    """Plain-English explanation of each behavior function."""
    explanations = {
        "attention": "maintained by the social attention it gets — whether positive or negative",
        "escape": "maintained by removing or avoiding something your pet finds unpleasant",
        "tangible": "maintained by gaining access to a desired item or activity",
        "sensory": "self-reinforcing through the physical sensation it provides",
    }
    return explanations.get(function, "serving a specific purpose for your pet")
