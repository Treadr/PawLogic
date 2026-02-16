# PawLogic

**"The science behind the paws."**

An AI-augmented pet behavior app grounded in Applied Behavior Analysis (ABA) methodology. Serves both cat and dog owners with a cat-forward market positioning. Core differentiator: clinical-grade ABA principles (validated by a credentialed RBT) delivered in a consumer-friendly mobile experience.

## Project Overview

- **What:** Mobile app for pet behavior tracking, analysis, and intervention using ABA science
- **Who:** Cat owners, dog owners, and multi-pet households
- **Why:** No competing app uses real ABA methodology; cat behavior is massively underserved; no app handles multi-pet household dynamics
- **Core thesis:** ABA principles are species-agnostic. The same science that drives human behavior therapy applies to animal behavior modification.

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Mobile App | React Native (Expo) | Single codebase for iOS/Android |
| Backend API | FastAPI (Python) | Async-native, strong ML/AI integration |
| Database | PostgreSQL + Supabase | Auth, real-time, storage out of the box |
| AI / LLM | Anthropic Claude API | Behavior insights, plan generation, conversational coaching |
| Data Analytics | Python (Pandas, NumPy) | ABC log pattern detection, correlation analysis |
| Notifications | Expo Notifications + OneSignal | Training reminders, pattern alerts, milestones |
| Hosting | Vercel + Railway (MVP) / AWS (scale) | Lower ops overhead for MVP phase |
| Charts | Victory Native or Recharts | Behavior trend graphs and progress visualizations |

## Core Features

### ABC Behavior Logging (The ABA Engine) - CENTERPIECE
Guided flow for logging incidents in under 30 seconds:
- **Antecedent:** What was happening right before? (doorbell, another pet nearby, owner leaving, feeding time)
- **Behavior:** What did the pet do? (scratched couch, hissed, urinated outside box, barked excessively)
- **Consequence:** What happened after? (owner yelled, other pet retreated, pet got attention/food)
- AI identifies patterns and correlations over time from accumulated logs

### Functional Behavior Assessment
- AI identifies the likely function of behavior from accumulated ABC data
- Four ABA functions: attention-seeking, escape/avoidance, access to tangibles, sensory/automatic
- Presented in plain English, not clinical jargon

### Behavior Intervention Plans (BIPs)
- AI-generated step-by-step behavior modification plans
- Species-appropriate and tailored to the identified function
- Includes: replacement behaviors, reinforcement schedules, antecedent modifications, phase advancement criteria

### Progress Tracking & Visualization
- Visual graphs showing behavior frequency over time
- Reinforcement schedule coaching (continuous, intermittent, fading)
- Progress milestones for engagement

### Vet Report Generator
- One-tap structured behavior summary with data charts
- Shareable with veterinarians
- Provides actionable data instead of vague descriptions

### Multi-Pet Household Features
- **Household Profile & Relationship Mapping:** Individual pet profiles with relationship visualization
- **Inter-Pet Interaction Logging:** Track multi-pet incidents, triggers, escalation, retreats
- **Resource Guarding Analysis:** Track conflicts around food, toys, sleeping spots, litter boxes, owner attention
- **New Pet Introduction Protocols:** Step-by-step plans for cat-to-cat, dog-to-dog, cat-to-dog, dog-to-cat
- **Household Harmony Score:** Aggregated metric dashboard combining interaction data, incidents, stress indicators
- **AI Environment Recommendations:** Suggests physical and schedule changes based on logged data

## Monetization Tiers

| Feature | Free | Premium ($7-10/mo) | Professional ($25-40/mo) |
|---------|------|-------------------|------------------------|
| Pet profiles | 1 pet | Unlimited | Unlimited + clients |
| ABC logging | Basic | Full + history | Full + export |
| AI insights | Limited | Full analysis | Advanced analytics |
| BIPs | Sample only | Full plans | Custom + templates |
| Multi-pet | -- | Full suite | Full suite |
| Vet reports | -- | Included | Branded reports |
| Introduction protocols | -- | Included | Included |
| Client management | -- | -- | Full CRM |

## Development Phases

### Phase 1: MVP
- Single-pet ABC logging with guided entry flow
- Basic AI pattern detection after 10+ logged incidents
- Simple behavior function identification
- Cat and dog species support with species-appropriate language
- User authentication and pet profile creation
- Basic progress charts

### Phase 2: Intelligence Layer
- Full AI-generated Behavior Intervention Plans
- Reinforcement schedule coaching
- Multi-pet household profiles and interaction logging
- Resource guarding analysis
- New pet introduction protocols
- Vet report generation
- Push notification system

### Phase 3: Growth & Expansion
- Household Harmony Score dashboard
- Video upload for AI behavior observation
- Professional tier with client management
- Community features (optional, curated)
- Partnerships with veterinary clinics and pet behaviorists
- App Store optimization and paid acquisition

## Brand & Design Guidelines

- **Color palette:** Deep indigo/navy (primary #6366F1) + warm coral (accent #FF7759). Warm stone neutrals.
- **Typography:** Clean sans-serif (Inter, Plus Jakarta Sans, or similar). Friendly but geometric.
- **Logo direction:** Minimalist mark combining subtle cat silhouette element with a data/logic element. Must work at app-icon size and monochrome.
- **Tone:** Knowledgeable friend who happens to be a behavior scientist. Not clinical, not condescending, genuinely helpful and slightly witty.
- **Brand attributes:** Science-backed, cat-savvy, empathetic, smart-casual

## Project Conventions

- This is a greenfield project -- no existing codebase yet
- The PDF spec (`ABA_Pet_Behavior_App_Overview.pdf`) in the project root is the source of truth for product requirements
- MVP focus: the ABC logging flow must be fast, intuitive, and produce genuinely useful insights -- everything else builds on that core loop
- ABA behavioral categories, ABC options, function mapping logic, and intervention strategy templates are core IP to be defined by the RBT team member before development
- Keep AI-generated content in plain English -- avoid clinical jargon in the user-facing experience
