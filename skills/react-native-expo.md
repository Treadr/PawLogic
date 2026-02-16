# Skill: React Native + Expo (Mobile Frontend)

## Purpose
Build and maintain the PawLogic cross-platform mobile application using React Native with Expo managed workflow.

## Tech Context
- **Framework:** React Native via Expo SDK
- **Navigation:** React Navigation (stack + bottom tabs)
- **State Management:** Zustand (lightweight) or React Context for MVP
- **Styling:** NativeWind (Tailwind for RN) or StyleSheet API
- **Charts:** Victory Native for behavior trend visualizations
- **Forms:** React Hook Form for ABC logging flow

## Core Competencies

### Project Scaffolding
- Initialize Expo project: `npx create-expo-app pawlogic --template blank-typescript`
- Configure TypeScript, ESLint, Prettier
- Set up path aliases (`@/components`, `@/screens`, `@/hooks`, `@/services`, `@/types`)
- Configure app.json/app.config.ts for both iOS and Android

### Screen Architecture (MVP)
```
screens/
  auth/
    LoginScreen.tsx
    RegisterScreen.tsx
  onboarding/
    WelcomeScreen.tsx
    PetProfileSetupScreen.tsx
  home/
    DashboardScreen.tsx
  abc-logging/
    AntecedentScreen.tsx
    BehaviorScreen.tsx
    ConsequenceScreen.tsx
    LogSummaryScreen.tsx
  insights/
    InsightsScreen.tsx
    BehaviorDetailScreen.tsx
  pet-profile/
    PetProfileScreen.tsx
    EditPetScreen.tsx
  progress/
    ProgressChartsScreen.tsx
```

### Component Library
- Build reusable components matching brand guidelines (teal/deep green primary, coral/amber accent)
- Typography: Inter or Plus Jakarta Sans via expo-font
- Chip selectors for ABC quick-entry (antecedent tags, behavior tags, consequence tags)
- Bottom sheet modals for quick-log flows
- Card components for insights display
- Chart wrappers for progress visualization

### ABC Logging Flow (Centerpiece)
The guided 3-step flow must complete in under 30 seconds:
1. **Antecedent selection** -- Pre-populated chips + custom entry. Contextual options based on species.
2. **Behavior selection** -- Species-appropriate behavior chips. Severity indicator. Quick description field.
3. **Consequence capture** -- What happened after. Owner response + environmental outcome.
4. **Summary confirmation** -- Review and save with one tap.

### Performance Requirements
- Logging flow: < 30 seconds from tap to save
- App launch: < 2 seconds to interactive
- Offline support: Queue logs locally, sync when connected
- Smooth 60fps scrolling on charts and lists

## Commands Reference
```bash
# Development
npx expo start                    # Start dev server
npx expo start --ios              # iOS simulator
npx expo start --android          # Android emulator

# Building
npx expo prebuild                 # Generate native projects
eas build --platform ios          # iOS build
eas build --platform android      # Android build

# Testing
npx jest                          # Run unit tests
npx jest --coverage               # Coverage report

# Linting
npx eslint . --ext .ts,.tsx       # Lint check
npx prettier --check .            # Format check
```

## Key Dependencies
```json
{
  "expo": "~52.x",
  "react-native": "0.76.x",
  "@react-navigation/native": "^7.x",
  "@react-navigation/bottom-tabs": "^7.x",
  "@react-navigation/native-stack": "^7.x",
  "zustand": "^5.x",
  "react-hook-form": "^7.x",
  "victory-native": "^41.x",
  "@supabase/supabase-js": "^2.x",
  "expo-notifications": "~0.29.x",
  "expo-secure-store": "~14.x"
}
```

## File Naming Conventions
- Screens: `PascalCase` + `Screen` suffix (e.g., `DashboardScreen.tsx`)
- Components: `PascalCase` (e.g., `ABCChipSelector.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useABCLogger.ts`)
- Services: `camelCase` (e.g., `apiClient.ts`, `supabaseClient.ts`)
- Types: `PascalCase` in dedicated `.types.ts` files
- Constants: `UPPER_SNAKE_CASE` in `constants/` directory

## Error Handling
- Use ErrorBoundary components for screen-level crash protection
- Toast notifications for user-facing errors (non-blocking)
- Alert dialogs for critical errors (auth failures, data loss prevention)
- Sentry or Expo error reporting for production monitoring

## Accessibility
- Support dynamic text sizing
- Ensure minimum 44x44pt touch targets
- Provide meaningful accessibilityLabel on all interactive elements
- Support both light and dark mode from launch
