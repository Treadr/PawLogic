# Skill: Anthropic Claude AI Integration

## Purpose
Integrate Claude API to power all AI-driven features in PawLogic: pattern detection in ABC logs, functional behavior assessment, behavior intervention plan generation, and conversational coaching.

## Tech Context
- **API:** Anthropic Claude API (Messages API)
- **Model:** claude-sonnet-4-5-20250929 (primary), claude-haiku-4-5-20251001 (lightweight tasks)
- **SDK:** anthropic Python SDK v0.43+
- **Integration Point:** FastAPI backend services layer
- **Async:** Full async support via `anthropic.AsyncAnthropic`

## AI Feature Mapping

### 1. ABC Pattern Detection (MVP)
**Trigger:** After 10+ ABC logs accumulated for a pet
**Model:** Sonnet (needs strong reasoning)
**Input:** Batch of ABC log entries for a specific pet
**Output:** Identified patterns, correlations, and recurring triggers

```python
PATTERN_DETECTION_PROMPT = """
You are a pet behavior analyst trained in Applied Behavior Analysis (ABA).
Analyze the following ABC (Antecedent-Behavior-Consequence) log entries for {pet_name},
a {species} ({breed}, {age}).

Identify:
1. Recurring antecedent-behavior pairs (what triggers keep leading to the same behavior?)
2. Consequence patterns (is the behavior being inadvertently reinforced?)
3. Time/location correlations
4. Severity trends (escalating, stable, or improving?)
5. Other pets' involvement patterns (if applicable)

Present findings in plain English. No clinical jargon.
Tone: knowledgeable friend who happens to be a behavior scientist.

ABC Log Data:
{formatted_logs}
"""
```

### 2. Functional Behavior Assessment (MVP)
**Trigger:** After pattern detection identifies a recurring behavior
**Model:** Sonnet
**Input:** Pattern analysis + relevant ABC logs
**Output:** Likely behavior function with confidence level

```python
FUNCTION_ASSESSMENT_PROMPT = """
Based on the ABC data patterns for {pet_name}, determine the most likely
function of the behavior: "{target_behavior}"

The four ABA behavior functions are:
- Attention-seeking: behavior is maintained by social attention (positive or negative)
- Escape/avoidance: behavior is maintained by removing or avoiding something aversive
- Access to tangibles: behavior is maintained by gaining access to items or activities
- Sensory/automatic: behavior is maintained by internal sensory stimulation

Provide:
1. Most likely function (one of the four above)
2. Confidence level (low/medium/high)
3. Supporting evidence from the logs
4. Plain-English explanation a pet owner would understand

Example good output: "Max is likely knocking things off the counter because you react
every time. He has learned that this gets your attention."

Do NOT use clinical terminology. Explain like talking to a friend.

Pattern Data:
{pattern_analysis}

Relevant ABC Logs:
{relevant_logs}
"""
```

### 3. Behavior Intervention Plan Generation (Phase 2)
**Trigger:** User requests a plan after function is identified
**Model:** Sonnet (complex reasoning + structured output)
**Input:** Function assessment + pet profile + ABC history
**Output:** Step-by-step BIP in structured JSON format

```python
BIP_GENERATION_PROMPT = """
Generate a Behavior Intervention Plan for {pet_name} ({species}, {breed}, {age}).

Target behavior: {target_behavior}
Identified function: {behavior_function}
Current frequency: {frequency} times per {period}

Create a species-appropriate plan that includes:
1. Replacement behaviors (what should the pet do instead?)
2. Antecedent modifications (environmental/schedule changes to prevent triggers)
3. Reinforcement schedule (start with continuous, plan for fading)
4. Specific reinforcers appropriate for {species}
5. Phase advancement criteria (when to move to the next phase)
6. Red flags (signs the plan isn't working and needs adjustment)

Output as structured JSON matching this schema:
{{
  "target_behavior": "string",
  "function": "string",
  "phases": [
    {{
      "phase_number": 1,
      "name": "string",
      "duration_estimate": "string",
      "replacement_behavior": "string",
      "antecedent_modifications": ["string"],
      "reinforcement_type": "continuous|intermittent|fading",
      "reinforcers": ["string"],
      "owner_actions": ["string"],
      "advancement_criteria": "string"
    }}
  ],
  "red_flags": ["string"],
  "general_tips": ["string"]
}}

Keep all language in plain English. Friendly, encouraging tone.
"""
```

### 4. Vet Report Narrative (Phase 2)
**Model:** Haiku (fast, structured output)
**Input:** ABC log summary data + behavior trends
**Output:** Professional but readable behavior summary for veterinarian

### 5. Conversational Coaching (Phase 2)
**Model:** Sonnet
**Input:** User question + pet context + ABC history
**Output:** Contextual ABA-grounded advice in conversational tone

## Implementation Architecture

### Service Layer
```python
# app/services/ai_service.py

from anthropic import AsyncAnthropic

class AIService:
    def __init__(self, api_key: str):
        self.client = AsyncAnthropic(api_key=api_key)

    async def analyze_patterns(self, pet, logs) -> PatternAnalysis:
        """Analyze ABC logs for patterns. Requires 10+ logs."""

    async def assess_function(self, pet, pattern, logs) -> FunctionAssessment:
        """Identify likely behavior function from patterns."""

    async def generate_bip(self, pet, assessment, logs) -> BehaviorPlan:
        """Generate a Behavior Intervention Plan."""

    async def generate_vet_narrative(self, pet, summary) -> str:
        """Generate vet-friendly behavior summary."""
```

### Token Management
- Track token usage per user per billing period
- Free tier: ~50K tokens/month (roughly 5-10 insight generations)
- Premium tier: ~500K tokens/month
- Use Haiku for lightweight tasks (vet reports, simple queries)
- Use Sonnet for complex analysis (pattern detection, BIP generation)

### Prompt Versioning
- Store prompt templates in `app/prompts/` directory
- Version prompts with semantic versioning (v1.0, v1.1, etc.)
- Log which prompt version produced each insight (for quality tracking)
- A/B test prompt variations when optimizing output quality

### Response Parsing
- Use structured output (JSON mode) where possible
- Validate AI responses against Pydantic schemas before storing
- Graceful fallback if AI response doesn't match expected schema
- Store raw AI responses for debugging and quality review

## Error Handling
- Retry with exponential backoff on rate limits (429)
- Fallback to cached insights if API is unavailable
- Never expose raw AI errors to the end user
- Log all AI interactions for quality monitoring
- Timeout: 30 seconds for pattern analysis, 60 seconds for BIP generation

## Content Safety
- All AI outputs pass through a basic content filter before user display
- AI should never diagnose medical conditions -- redirect to vet
- Include disclaimer: "AI-generated insights. Consult a veterinary professional for medical concerns."
- Never recommend punishment-based interventions (ABA principle)

## Cost Estimation (MVP)
- Pattern analysis: ~2K input + ~1K output tokens per run = ~$0.01/analysis (Sonnet)
- Function assessment: ~1.5K input + ~500 output = ~$0.008/assessment (Sonnet)
- Assuming 1000 active users, 2 analyses/week = ~$80/month API cost
