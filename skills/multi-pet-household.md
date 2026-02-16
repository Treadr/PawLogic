# Skill: Multi-Pet Household Features

## Purpose
Implement the multi-pet household system that treats the home as a behavioral ecosystem -- tracking inter-pet dynamics, resource guarding, introduction protocols, and the Household Harmony Score.

## Phase: Phase 2 (Intelligence Layer)

## Feature Set

### 1. Household Profile & Relationship Mapping
**Data Model:**
- A user creates a "Household" containing multiple pets
- Each pet pair has a tracked relationship status
- Relationship data is derived from interaction logs + manual assessment

**Relationship States:**
| State | Description |
|-------|-------------|
| Bonded | Regularly positive interactions, mutual comfort |
| Friendly | Mostly positive, occasional minor tension |
| Neutral | Coexist without significant positive or negative interaction |
| Tense | Frequent avoidance or minor conflicts |
| Hostile | Active aggression, requires separation management |
| New/Unknown | Insufficient data to classify |

**Visualization:**
- Pet avatars arranged in a circle/network graph
- Lines between pairs colored by relationship state (green → red spectrum)
- Tap a connection line to see interaction history for that pair

### 2. Inter-Pet Interaction Logging
Extended ABC log specifically for multi-pet incidents:

```typescript
interface InteractionLog {
  household_id: string;
  initiator_pet_id: string;    // Who started it
  target_pet_id: string;       // Who was affected
  interaction_type: 'positive' | 'neutral' | 'negative' | 'avoidance';
  trigger: string;             // What prompted the interaction
  escalation_level: 1-5;       // 1=mild curiosity, 5=active aggression
  who_escalated: string;       // Which pet escalated (if applicable)
  who_retreated: string;       // Which pet retreated (if applicable)
  resource_involved?: string;  // Food, toy, sleeping spot, litter box, owner attention
  location: string;
  duration_seconds?: number;
  notes?: string;
  occurred_at: DateTime;
}
```

**Quick-Log for Interactions:**
- "Who was involved?" → Select 2+ pet avatars
- "What happened?" → Positive / Neutral / Negative / Avoidance chips
- "What triggered it?" → Context chips + free text
- "Who escalated? Who retreated?" → Pet avatar selection
- "Was a resource involved?" → Resource chips

### 3. Resource Guarding Analysis
Track conflicts around specific resources:

**Tracked Resources:**
- Food bowls / feeding stations
- Water bowls
- Toys (specific items if possible)
- Sleeping spots (beds, couches, cat trees)
- Litter boxes
- Owner attention/lap time
- Doorways / pathways
- Window perches

**Analysis Output:**
```json
{
  "contested_resources": [
    {
      "resource": "food bowl near kitchen",
      "conflict_count": 8,
      "primary_guarder": "Duke (dog)",
      "affected_pet": "Luna (cat)",
      "peak_time": "5:00 PM - 6:00 PM",
      "recommendation": "Separate feeding stations in different rooms. Feed Luna on an elevated surface."
    }
  ]
}
```

### 4. New Pet Introduction Protocols
Step-by-step, science-based introduction plans with progress gates.

**Supported Combinations:**
| Type | Duration | Phases |
|------|----------|--------|
| Cat-to-Cat | 2-6 weeks | 7 phases |
| Dog-to-Dog | 1-4 weeks | 5 phases |
| Cat-to-Dog | 3-8 weeks | 8 phases |
| Dog-to-Cat | 3-8 weeks | 8 phases |

**Cat-to-Cat Introduction Protocol (Example):**
```json
{
  "protocol": "cat-to-cat",
  "phases": [
    {
      "phase": 1,
      "name": "Scent Introduction",
      "duration": "3-5 days",
      "instructions": [
        "Keep cats in completely separate rooms",
        "Swap bedding between cats daily",
        "Feed on opposite sides of the closed door"
      ],
      "advancement_criteria": "Both cats eating calmly near the door",
      "log_prompts": ["Are both cats eating near the door?", "Any hissing at the door?"]
    },
    {
      "phase": 2,
      "name": "Visual Introduction",
      "duration": "3-7 days",
      "instructions": [
        "Use a baby gate or cracked door for visual contact",
        "Keep sessions to 5-10 minutes initially",
        "Reward calm behavior with treats"
      ],
      "advancement_criteria": "Both cats show relaxed body language during visual contact for 3 consecutive sessions",
      "red_flags": ["Persistent hissing", "Flattened ears", "Puffed tail"]
    }
  ]
}
```

### 5. Household Harmony Score
Aggregated metric combining multiple data sources:

**Score Components:**
| Component | Weight | Data Source |
|-----------|--------|-------------|
| Interaction positivity ratio | 30% | Interaction logs |
| Individual behavior trends | 25% | ABC logs per pet |
| Resource conflict frequency | 20% | Resource guarding logs |
| Stress indicator trends | 15% | Avoidance + anxiety behaviors |
| Introduction progress | 10% | Protocol advancement (if active) |

**Score Range:**
- 90-100: Harmonious household
- 70-89: Generally peaceful, minor areas to watch
- 50-69: Some tension, intervention recommended
- Below 50: Significant conflict, professional consultation suggested

**Display:**
- Large circular gauge on Household dashboard
- Trend arrow (improving/declining/stable)
- Breakdown by component on tap
- Weekly comparison

### 6. AI Environment Recommendations
Based on accumulated household data, the AI suggests modifications:

**Categories:**
- **Spatial:** Add vertical space, create escape routes, separate resources
- **Temporal:** Stagger feeding times, adjust play schedules
- **Resource:** Add litter boxes (N+1 rule for cats), duplicate key resources
- **Behavioral:** Structured positive interaction sessions, parallel play

**Example Outputs:**
- "Adding a second cat tree in the living room could reduce confrontations. Luna retreats upward 70% of the time."
- "Most conflicts occur between 5-6 PM. Consider feeding Luna and Duke in separate rooms."
- "With 2 cats, you need at minimum 3 litter boxes. Consider adding one on the second floor."

## API Endpoints (Phase 2)
```
POST   /api/v1/households                    # Create household
GET    /api/v1/households                    # List user's households
POST   /api/v1/households/{id}/pets          # Add pet to household
DELETE /api/v1/households/{id}/pets/{pet_id}  # Remove pet from household
POST   /api/v1/households/{id}/interactions  # Log inter-pet interaction
GET    /api/v1/households/{id}/interactions  # List interactions
GET    /api/v1/households/{id}/harmony-score # Get harmony score
GET    /api/v1/households/{id}/resources     # Get resource guarding analysis
POST   /api/v1/households/{id}/introductions # Start introduction protocol
GET    /api/v1/households/{id}/introductions/{intro_id} # Get protocol status
PUT    /api/v1/households/{id}/introductions/{intro_id}/advance # Advance phase
GET    /api/v1/households/{id}/recommendations # Get AI environment recommendations
```
