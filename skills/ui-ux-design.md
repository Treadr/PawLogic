# Skill: UI/UX Design System

## Purpose
Define the visual design system, component library, and UX patterns for PawLogic aligned with the brand identity: science-backed, cat-savvy, empathetic, smart-casual.

## Brand Design Tokens

### Color Palette
```typescript
const colors = {
  // Primary -- Teal/Deep Green (trust, intelligence, calm)
  primary: {
    50:  '#E6F5F3',
    100: '#B3E2DB',
    200: '#80CFC3',
    300: '#4DBCAB',
    400: '#26AD98',
    500: '#0D9E85',  // Main brand color
    600: '#0B8A74',
    700: '#097563',
    800: '#076052',
    900: '#054B41',
  },

  // Accent -- Warm Coral (energy, warmth, approachability)
  accent: {
    50:  '#FFF0ED',
    100: '#FFD5CC',
    200: '#FFB9AA',
    300: '#FF9D88',
    400: '#FF8A70',
    500: '#FF7759',  // Main accent color
    600: '#E0664D',
    700: '#C05541',
    800: '#A04535',
    900: '#803529',
  },

  // Amber alternative accent
  amber: {
    500: '#F5A623',
    600: '#D4911E',
  },

  // Neutrals
  neutral: {
    50:  '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error:   '#EF4444',
  info:    '#3B82F6',

  // Backgrounds
  background: '#FAFAFA',
  surface:    '#FFFFFF',
  surfaceAlt: '#F0FAF8',  // Subtle teal tint
};
```

### Typography
```typescript
const typography = {
  fontFamily: {
    heading: 'PlusJakartaSans-Bold',
    body:    'Inter-Regular',
    bodyMed: 'Inter-Medium',
    bodySem: 'Inter-SemiBold',
    mono:    'JetBrainsMono-Regular',  // For data displays
  },
  fontSize: {
    xs:   12,
    sm:   14,
    base: 16,
    lg:   18,
    xl:   20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight:  1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

### Spacing Scale
```typescript
const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};
```

### Border Radius
```typescript
const borderRadius = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  full: 9999,  // Pills and circles
};
```

### Shadows
```typescript
const shadows = {
  sm: { shadowOffset: {width: 0, height: 1}, shadowRadius: 2, shadowOpacity: 0.05 },
  md: { shadowOffset: {width: 0, height: 2}, shadowRadius: 4, shadowOpacity: 0.1 },
  lg: { shadowOffset: {width: 0, height: 4}, shadowRadius: 8, shadowOpacity: 0.15 },
};
```

## Core Components

### ChipSelector
Used throughout the ABC logging flow for quick tag selection.
```
┌──────────────────────────────────────┐
│  ┌─────────┐ ┌──────────┐ ┌───────┐ │
│  │ Doorbell│ │ Loud noise│ │ Vacuum│ │
│  └─────────┘ └──────────┘ └───────┘ │
│  ┌───────────────┐ ┌──────────────┐  │
│  │ Another pet   │ │ Owner leaving│  │
│  └───────────────┘ └──────────────┘  │
└──────────────────────────────────────┘
```
- Unselected: outlined, neutral-300 border, neutral-700 text
- Selected: filled primary-500 background, white text
- Multi-select supported (up to 3 selections)
- Wrap layout with consistent gap spacing

### InsightCard
Displays AI-generated behavioral insights on the dashboard.
```
┌──────────────────────────────────────┐
│ 🔍  Pattern Detected                 │
│                                      │
│ Bella scratches the couch most often │
│ when your dog is in the same room.   │
│ This suggests stress-related         │
│ behavior.                            │
│                                      │
│ Based on 8 of 12 incidents           │
│                            See more →│
└──────────────────────────────────────┘
```
- Surface background with primary-50 left border accent
- Insight type icon in primary color
- Body text in neutral-700
- Confidence indicator as subtle progress bar

### ProgressChart
Behavior frequency over time using Victory Native.
- Line chart with primary color fill
- X-axis: dates (daily/weekly)
- Y-axis: incident count
- Highlight trend direction with color (green = decreasing, coral = increasing)
- Touch interaction to see day details

### SeveritySlider
Visual 1-5 scale for behavior severity rating.
```
  Mild ─────●─────────────── Severe
   1    2    3    4    5
```
- Color gradient from success (green) through warning (amber) to error (red)
- Haptic feedback on selection
- Large thumb for easy touch targeting (48x48)

### PetAvatar
Pet profile image with species indicator.
- Circular image, 48px default size
- Species badge (cat/dog icon) at bottom-right
- Fallback: species silhouette in primary-100 background
- Multiple sizes: sm (32), md (48), lg (64), xl (96)

## Screen Layouts

### Dashboard
```
┌──────────────────────────────────┐
│  PawLogic              ⚙️        │
│                                  │
│  ┌──────────────────────────┐    │
│  │ 🐱 Luna          3 today │    │
│  │ Last: scratched couch     │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │    + Log New Incident    │    │ ← Primary CTA (large, prominent)
│  └──────────────────────────┘    │
│                                  │
│  Recent Insights                 │
│  ┌──────────────────────────┐    │
│  │ InsightCard              │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ InsightCard              │    │
│  └──────────────────────────┘    │
│                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  🏠 Home   📊 Progress  👤 Profile│
└──────────────────────────────────┘
```

### ABC Logging Flow
- Full-screen modal (slides up from bottom)
- Progress indicator at top (Step 1/4, 2/4, 3/4, 4/4)
- Swipe gesture navigation between steps
- Back button always visible
- "Skip notes" option to keep flow fast

## Animation & Interaction
- Screen transitions: slide-in from right (navigation), slide-up (modals)
- Chip selection: subtle scale + color transition (150ms)
- Log saved: success checkmark animation (300ms) + haptic
- Insight reveal: fade-in with slight upward movement
- Chart data: animated line drawing on first render

## Accessibility Requirements
- All touch targets minimum 44x44pt
- Color contrast ratio: 4.5:1 minimum for text
- Support Dynamic Type (iOS) / font scaling (Android)
- Screen reader labels on all interactive elements
- Do not rely on color alone to convey meaning

## Dark Mode
- Background: neutral-900
- Surface: neutral-800
- Primary colors remain the same (teal maintains contrast)
- Accent colors slightly desaturated for dark context
- Text: neutral-100 (primary), neutral-400 (secondary)

## Loading States
- Skeleton screens for data-dependent views (not spinners)
- Inline loading indicators for actions (button loading state)
- Pull-to-refresh on list views
- Optimistic updates for log creation (show immediately, sync in background)
