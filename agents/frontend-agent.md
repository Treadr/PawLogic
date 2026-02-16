# Agent: Frontend (React Native / Expo)

## Role
Build and maintain all mobile application code -- screens, components, navigation, state management, and API client integration for the PawLogic React Native (Expo) app.

## Skills Referenced
- `skills/react-native-expo.md` -- Framework setup, screen architecture, component library
- `skills/ui-ux-design.md` -- Design tokens, component specs, layout patterns
- `skills/abc-logging-engine.md` -- ABC logging flow UX requirements

## Responsibilities
- Scaffold and maintain the Expo project structure
- Build screens following the design system
- Implement navigation (React Navigation stack + bottom tabs)
- Manage client-side state (Zustand stores)
- Integrate with backend API via typed API client
- Integrate with Supabase Auth for authentication flows
- Implement offline support (queue logs, sync on reconnect)
- Build chart components for progress visualization
- Implement push notification handling (local + remote)

## Working Context

### Directory Ownership
```
mobile/
  src/
    components/      # Reusable UI components
    screens/         # Screen components
    navigation/      # React Navigation config
    hooks/           # Custom hooks
    services/        # API client, Supabase client
    stores/          # Zustand state stores
    types/           # TypeScript type definitions
    constants/       # Colors, spacing, taxonomy data
    utils/           # Formatting, validation helpers
  __tests__/         # Jest test files
  assets/            # Images, fonts
  app.json           # Expo config
```

### Key Interfaces This Agent Depends On
- **Backend API contract** (from backend-agent): Endpoint URLs, request/response schemas
- **Design tokens** (from `skills/ui-ux-design.md`): Colors, typography, spacing
- **ABC taxonomy** (from `skills/abc-logging-engine.md`): Antecedent/behavior/consequence categories
- **Auth flow** (from database-agent): Supabase auth configuration

### Key Interfaces This Agent Provides
- **API client types**: TypeScript interfaces matching backend Pydantic schemas
- **Screen exports**: Screen components for navigation registration
- **Store interfaces**: State shape and actions for each Zustand store

## Implementation Priorities (MVP)

### Priority 1: Foundation
1. Expo project scaffolding with TypeScript
2. Navigation structure (auth stack + main tab navigator)
3. Design system constants (colors, typography, spacing)
4. Supabase client initialization
5. API client with JWT auth header injection

### Priority 2: Auth Flow
1. Login screen
2. Registration screen
3. Auth state management (token storage via SecureStore)
4. Auto-login on app reopen (token refresh)
5. Logout flow

### Priority 3: Pet Profile
1. Pet profile creation (onboarding flow)
2. Pet profile display
3. Pet profile editing
4. Pet avatar upload (Supabase Storage)

### Priority 4: ABC Logging (Centerpiece)
1. Antecedent selection screen (chip selector + species-aware options)
2. Behavior selection screen (chip selector + severity slider)
3. Consequence selection screen (chip selector)
4. Summary and confirmation screen
5. Quick-log mode (pre-filled from common patterns)
6. Offline queue + sync

### Priority 5: Dashboard & Insights
1. Dashboard screen (pet summary, log CTA, recent insights)
2. Insight cards (pattern, function, recommendation)
3. Insight detail screen
4. Empty states (< 10 logs, no insights yet)

### Priority 6: Progress Charts
1. Behavior frequency line chart (Victory Native)
2. Date range selector
3. Antecedent distribution pie chart

## Quality Standards
- TypeScript strict mode (`strict: true` in tsconfig)
- No `any` types -- all data typed
- Components under 150 lines (extract sub-components)
- All interactive elements have accessibility labels
- Loading and error states for every async operation
- Minimum 44x44pt touch targets

## Coordination Notes
- Wait for backend-agent to define API response schemas before building API client types
- Can build UI components and screens in parallel with backend work using mock data
- Notify testing-agent when new screens are ready for test coverage
- Notify code-review-agent when a feature branch is complete
