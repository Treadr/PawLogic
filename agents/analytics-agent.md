# Agent: Data Analytics

## Role
Implement and optimize the quantitative analytics pipeline -- pattern detection algorithms, trend calculations, data aggregation, and statistical analysis that feeds into AI insights and progress charts.

## Skills Referenced
- `skills/data-analytics.md` -- Analytics functions, thresholds, chart data preparation
- `skills/abc-logging-engine.md` -- ABA domain knowledge, behavior functions

## Responsibilities
- Implement pattern detection algorithms (antecedent-behavior pair analysis)
- Build reinforcement pattern analysis (consequence → behavior frequency)
- Calculate temporal correlations (time-of-day, day-of-week patterns)
- Prepare data summaries for Claude AI prompts
- Generate chart-ready data for the mobile app progress views
- Compute progress metrics against active BIPs
- Build the Household Harmony Score algorithm (Phase 2)
- Optimize analytics queries for performance

## Working Context

### Directory Ownership
```
backend/
  app/
    services/
      abc_analyzer.py         # Pattern detection core logic
      analytics_service.py    # Analytics pipeline orchestration
      progress_service.py     # Progress metric calculations
      harmony_scorer.py       # Household Harmony Score (Phase 2)
    utils/
      data_formatters.py      # Format data for AI prompts and charts
```

## Core Algorithms

### Antecedent-Behavior Pair Detection
```
Input: List of ABC logs for a pet
Process:
  1. Count occurrences of each unique (antecedent_tag, behavior_tag) pair
  2. Calculate percentage of total logs for each pair
  3. Flag pairs exceeding PATTERN_SIGNIFICANCE threshold (30%)
  4. Rank by frequency
Output: List of significant A-B pairs with frequency and percentage
```

### Reinforcement Pattern Detection
```
Input: List of ABC logs for a pet, ordered by time
Process:
  1. For each behavior type, group by consequence
  2. Track behavior frequency in the week AFTER each consequence type
  3. If behavior frequency increases after a specific consequence → reinforcement detected
  4. Calculate reinforcement ratio (consequence frequency / behavior frequency)
Output: List of consequence-behavior pairs with reinforcement indicators
```

### Temporal Analysis
```
Input: List of ABC logs with timestamps
Process:
  1. Extract hour-of-day and day-of-week from each log
  2. Build frequency matrix (24 hours x 7 days)
  3. Identify peak cells (>2 standard deviations above mean)
  4. Identify quiet periods (0 occurrences with >14 days of data)
Output: Heatmap data, peak times, quiet periods
```

### Trend Calculation
```
Input: List of ABC logs for a pet, time window (default 14 days)
Process:
  1. Split into two equal halves (first week vs second week)
  2. Compare behavior count: first half vs second half
  3. Calculate percentage change
  4. Classify: increasing (>20% up), decreasing (>20% down), stable
Output: Trend direction, percentage change, comparison data
```

### Progress Against BIP
```
Input: ABC logs since BIP start date, BIP advancement criteria
Process:
  1. Count target behavior occurrences per period
  2. Count replacement behavior occurrences per period
  3. Calculate rolling average (7-day window)
  4. Compare against BIP phase criteria
  5. Determine if advancement criteria are met
Output: Progress metrics, advancement readiness, visualization data
```

## Thresholds (Configurable)
```python
MIN_LOGS_FOR_PATTERNS = 10        # Minimum logs before analysis
MIN_LOGS_FOR_FUNCTION = 15        # Minimum for function assessment
PATTERN_SIGNIFICANCE = 0.30       # 30% co-occurrence = significant
REINFORCEMENT_RATIO = 0.50        # 50% consequence-behavior link
TREND_WINDOW_DAYS = 14            # Compare last 2 weeks
IMPROVEMENT_THRESHOLD = 0.20      # 20% reduction = improvement
HARMONY_SCORE_MIN_INTERACTIONS = 5 # Min interactions for scoring
```

## Chart Data Formats

### Behavior Frequency (Line Chart)
```json
[
  {"date": "2026-02-01", "count": 3, "severity_avg": 2.5},
  {"date": "2026-02-02", "count": 1, "severity_avg": 1.0},
  {"date": "2026-02-03", "count": 0, "severity_avg": null}
]
```

### Antecedent Distribution (Pie Chart)
```json
[
  {"category": "Other pet present", "count": 7, "percentage": 35.0},
  {"category": "Doorbell", "count": 4, "percentage": 20.0},
  {"category": "Feeding time", "count": 3, "percentage": 15.0}
]
```

### Temporal Heatmap
```json
{
  "hours": [0, 1, ..., 23],
  "days": ["Mon", "Tue", ..., "Sun"],
  "data": [[0, 0, 1, ...], ...]
}
```

## Performance Requirements
- Pattern detection for 100 logs: < 500ms
- Chart data preparation: < 200ms
- Analytics should run server-side (not in the mobile app)
- Cache results with 1-hour TTL, invalidate on new log entry
- Use SQL aggregations where possible before loading into Python

## Coordination Notes
- Provide formatted data summaries to ai-agent for prompt input
- Provide chart-ready data formats to frontend-agent for Victory Native
- Coordinate with database-agent on index optimization for analytics queries
- Coordinate with backend-agent on endpoint response schemas
- Report analytics thresholds to testing-agent for test assertions
