# Skill: ABC Logging Engine (Core ABA Feature)

## Purpose
Define the behavioral science framework, data structures, and UX flow for the ABC (Antecedent-Behavior-Consequence) logging system -- the centerpiece feature of PawLogic.

## ABA Foundation
The ABC model is the gold standard in Applied Behavior Analysis for understanding why behaviors occur:
- **A (Antecedent):** What happened immediately before the behavior?
- **B (Behavior):** What did the pet do? (observable, measurable)
- **C (Consequence):** What happened immediately after the behavior?

Over time, ABC data reveals **functional relationships** -- the "why" behind behavior.

## The Four Behavior Functions (ABA)
Every behavior serves one of four functions:
1. **Attention-seeking:** Behavior is maintained by social attention (positive or negative)
2. **Escape/Avoidance:** Behavior is maintained by removing/avoiding something aversive
3. **Access to Tangibles:** Behavior is maintained by gaining access to items or activities
4. **Sensory/Automatic:** Behavior is self-reinforcing through internal sensory stimulation

## ABC Category Taxonomy

### Antecedent Categories (What Triggered It?)

#### Cat-Specific Antecedents
| Category | Example Tags |
|----------|-------------|
| Environmental change | Doorbell, loud noise, vacuum, new furniture, moved litter box |
| Other animal present | Dog nearby, other cat nearby, saw animal outside window |
| Owner behavior | Owner leaving, owner arrived, picked up cat, woke cat |
| Resource-related | Feeding time, empty food bowl, dirty litter box, blocked favorite spot |
| Schedule disruption | Late feeding, changed routine, new work schedule |
| Social pressure | Guest in house, too much handling, cornered |
| Medical/physical | Post-vet visit, medication time, grooming |

#### Dog-Specific Antecedents
| Category | Example Tags |
|----------|-------------|
| Environmental change | Doorbell, loud noise, thunderstorm, new person, car ride |
| Other animal present | Other dog, cat, squirrel, unfamiliar animal |
| Owner behavior | Owner leaving, owner arrived, grabbed leash, said "no" |
| Resource-related | Feeding time, saw treat, toy visible, bone present |
| Separation cues | Owner picking up keys, putting on shoes, grabbing bag |
| Social situation | Dog park, walk encounter, guest arrival |
| Medical/physical | Post-vet visit, grooming, nail trim, bath |

### Behavior Categories (What Did They Do?)

#### Cat Behaviors
| Category | Example Tags |
|----------|-------------|
| Elimination | Urinated outside box, defecated outside box, spraying |
| Aggression | Hissed, swatted, bit, growled, puffed up |
| Destructive | Scratched furniture, knocked items off surface, chewed cords |
| Vocalization | Excessive meowing, yowling, midnight vocalizing |
| Avoidance | Hid, ran away, refused to come out, cowered |
| Attention-seeking | Headbutting, pawing at owner, jumping on counter, sitting on keyboard |
| Compulsive | Over-grooming, wool sucking, tail chasing, pica |
| Inter-pet | Chased other pet, blocked doorway, stared down, ambushed |

#### Dog Behaviors
| Category | Example Tags |
|----------|-------------|
| Elimination | Indoor urination, indoor defecation, marking |
| Aggression | Barked aggressively, growled, snapped, lunged, bit |
| Destructive | Chewed furniture, dug holes, destroyed toys, tore up trash |
| Vocalization | Excessive barking, whining, howling |
| Anxiety | Pacing, panting, trembling, drooling, destructive when alone |
| Attention-seeking | Jumping on people, pawing, nudging, stealing items |
| Leash behavior | Pulling, lunging at other dogs, reactive on leash |
| Inter-pet | Resource guarding, mounting, chasing, bullying |

### Consequence Categories (What Happened After?)

#### Owner Responses
| Category | Example Tags |
|----------|-------------|
| Verbal reaction | Yelled, said "no", laughed, talked to pet |
| Physical response | Picked up pet, pushed away, petted/comforted, moved pet |
| Attention given | Looked at pet, went to pet, engaged with pet |
| Attention removed | Ignored behavior, walked away, left room |
| Resource provided | Gave treat, gave toy, opened door, provided food |
| Resource removed | Took away item, closed door, removed from situation |

#### Environmental Outcomes
| Category | Example Tags |
|----------|-------------|
| Other pet reaction | Other pet retreated, other pet engaged, other pet hid |
| Environmental change | Noise stopped, person left, door opened/closed |
| Nothing changed | No apparent consequence, situation continued |

## Logging Flow UX (< 30 Seconds)

### Step 1: Select Pet (if multiple)
- Show pet avatars at top, tap to select
- Default to last-logged pet

### Step 2: Antecedent (What triggered it?)
- Display category chips based on pet species
- User taps 1-3 relevant tags
- Optional: free-text "anything else?" field
- Auto-suggest based on time of day and history

### Step 3: Behavior (What happened?)
- Species-appropriate behavior chips
- Severity slider (1-5): Mild → Moderate → Severe
- Optional: brief notes field
- Show behavior icon/illustration for quick recognition

### Step 4: Consequence (What happened after?)
- Split into "What did you do?" and "What else happened?"
- Chip selection + optional notes
- Include "Nothing / I ignored it" as a prominent option

### Step 5: Confirm & Save
- Summary card showing A → B → C
- Timestamp (auto-filled, adjustable)
- Location tag (optional)
- "Other pets present?" toggle (for multi-pet analysis)
- Save button → confirmation animation → return to dashboard

## Severity Scale
| Level | Label | Description |
|-------|-------|-------------|
| 1 | Mild | Minor occurrence, no damage or distress |
| 2 | Low-moderate | Noticeable but manageable |
| 3 | Moderate | Concerning, causes disruption |
| 4 | High-moderate | Significant problem, potential for harm |
| 5 | Severe | Dangerous, destructive, or highly distressing |

## Smart Features

### Quick-Log Mode
- After 5+ logs, offer "Quick Log" with pre-filled most common A-B-C combo
- User just taps to confirm or edits one field
- Target: < 10 seconds for repeat patterns

### Time-Aware Suggestions
- Morning: surface feeding-related and separation antecedents
- Evening: surface multi-pet and owner-arrival antecedents
- Late night: surface vocalization behaviors

### Pattern Nudges
- After 10 logs: "We're starting to see a pattern. Tap to see what we've found."
- After 20 logs: "We have enough data for a behavior assessment."
- After a BIP starts: "Log even when things go well -- it helps us track progress."

## Data Integrity Rules
- Every log MUST have at least one antecedent tag, one behavior tag, one consequence tag
- Timestamp cannot be in the future
- Severity must be 1-5
- Pet must belong to the logged-in user
- Antecedent/behavior/consequence tags must be from the approved taxonomy (custom text goes in notes)

## Offline Behavior
- Logs created offline are stored in AsyncStorage with a `synced: false` flag
- On reconnection, queue auto-syncs oldest-first
- Conflict resolution: server timestamp wins, client data preserved
- Show sync status indicator on dashboard
