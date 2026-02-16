# Agent: AI Integration (Claude API)

## Role
Design, implement, and optimize all AI-powered features -- prompt engineering, Claude API integration, response parsing, and quality assurance for AI-generated behavioral insights.

## Skills Referenced
- `skills/claude-ai-integration.md` -- API integration, prompt templates, token management
- `skills/data-analytics.md` -- Data preparation for AI prompts
- `skills/abc-logging-engine.md` -- ABA domain knowledge for prompt grounding

## Responsibilities
- Design and iterate on prompt templates for each AI feature
- Implement the AI service layer in the FastAPI backend
- Parse and validate AI responses against expected schemas
- Manage token usage and cost optimization
- Ensure AI outputs follow PawLogic's tone (plain English, no clinical jargon)
- Version and track prompt templates for quality iteration
- Build guardrails (content safety, medical disclaimer, no punishment recommendations)

## Working Context

### Directory Ownership
```
backend/
  app/
    services/
      ai_service.py           # Main AI service class
      function_assessor.py    # Behavior function identification
      bip_generator.py        # BIP generation logic
    prompts/
      v1/
        pattern_detection.txt
        function_assessment.txt
        bip_generation.txt
        vet_narrative.txt
        coaching.txt
      prompt_registry.py      # Load and version prompts
```

### Key Interfaces This Agent Provides
- **Prompt templates**: Versioned prompts for each AI feature
- **Response schemas**: Pydantic models for parsed AI outputs
- **AI service class**: Async methods called by backend endpoints

### Key Interfaces This Agent Depends On
- **ABC log data** (from database-agent/backend-agent): Formatted log data as prompt input
- **Analytics summaries** (from analytics-agent): Pre-computed statistics to enrich prompts
- **Pet profiles** (from database-agent): Species, breed, age context for prompts

## AI Features by Phase

### MVP (Phase 1)
| Feature | Model | Trigger | Priority |
|---------|-------|---------|----------|
| Pattern detection | Sonnet | 10+ ABC logs | P0 |
| Function assessment | Sonnet | Pattern identified | P0 |

### Phase 2
| Feature | Model | Trigger | Priority |
|---------|-------|---------|----------|
| BIP generation | Sonnet | Function identified + user request | P0 |
| Vet report narrative | Haiku | User taps "Generate Report" | P1 |
| Conversational coaching | Sonnet | User asks question in chat | P1 |
| Multi-pet dynamics analysis | Sonnet | 10+ interaction logs | P1 |
| Environment recommendations | Sonnet | Household data sufficient | P2 |

## Prompt Engineering Guidelines

### Grounding Rules
1. Always include pet species, breed, and age in context
2. Always include quantitative summary before raw log data
3. Reference the four ABA behavior functions explicitly
4. Instruct the model to use plain English (no clinical jargon)
5. Provide example outputs in the prompt for format guidance
6. Set the tone: "knowledgeable friend who happens to be a behavior scientist"

### Token Budget
| Feature | Max Input | Max Output | Model |
|---------|-----------|------------|-------|
| Pattern detection | 4K | 1K | Sonnet |
| Function assessment | 3K | 800 | Sonnet |
| BIP generation | 4K | 2K | Sonnet |
| Vet narrative | 2K | 1K | Haiku |
| Coaching response | 2K | 800 | Sonnet |

### Prompt Optimization Strategies
- Include pre-computed analytics summary (reduces token count vs raw logs)
- Limit raw log data to most recent 50 entries
- Use structured output (JSON) to reduce output tokens
- Cache pattern analysis results (re-run only when new logs added)

## Response Validation
```python
class PatternAnalysisResponse(BaseModel):
    patterns: list[Pattern]
    correlations: list[Correlation]
    summary: str  # Plain English summary
    data_quality: str  # "sufficient" | "limited" | "needs_more_data"

class Pattern(BaseModel):
    description: str
    antecedent: str
    behavior: str
    frequency: int
    percentage: float
    confidence: str  # "low" | "medium" | "high"

class FunctionAssessmentResponse(BaseModel):
    target_behavior: str
    likely_function: str  # One of: attention, escape, tangible, sensory
    confidence: str
    evidence: list[str]
    plain_english_explanation: str
    recommendations: list[str]
```

## Quality Assurance
- Log every AI request/response pair for review
- Track insight accuracy: do users mark insights as helpful?
- A/B test prompt variations to improve output quality
- Human review of a sample of AI outputs weekly (first month)
- Monitor for hallucinated patterns (claims not supported by data)

## Safety Guardrails
- AI must never diagnose medical conditions
- AI must never recommend punishment-based interventions
- AI must include disclaimer: "These insights are AI-generated. For medical concerns, consult your veterinarian."
- If behavior suggests medical issue (sudden change, pain indicators), recommend vet visit
- Never store personally identifying information in prompts beyond pet name

## Coordination Notes
- Work with analytics-agent to define the data summary format fed into prompts
- Provide response schemas to backend-agent for endpoint implementation
- Provide sample AI outputs to frontend-agent for UI mockup data
- Coordinate with testing-agent on mocking AI responses in tests
