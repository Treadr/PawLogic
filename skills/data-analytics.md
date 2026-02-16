# Skill: Data Analytics (Python)

## Purpose
Implement the quantitative analytics pipeline for PawLogic -- pattern detection in ABC logs, correlation analysis, progress trend calculations, and data preparation for AI insight generation.

## Tech Context
- **Language:** Python 3.12+
- **Libraries:** Pandas 2.2+, NumPy 2.1+, SciPy (optional for statistical tests)
- **Integration:** Called from FastAPI services, outputs feed into Claude AI prompts
- **Data Source:** PostgreSQL via async SQLAlchemy queries

## Core Analytics Functions

### 1. ABC Log Aggregation
```python
def aggregate_abc_logs(logs: list[ABCLog], period: str = "week") -> pd.DataFrame:
    """
    Aggregate ABC logs into time-bucketed summaries.
    - Behavior frequency per period (daily, weekly, monthly)
    - Top antecedent categories by frequency
    - Top consequence categories by frequency
    - Severity trends over time
    """
```

### 2. Pattern Detection
```python
def detect_antecedent_behavior_pairs(logs: list[ABCLog]) -> list[PatternResult]:
    """
    Identify statistically significant antecedent-behavior co-occurrences.
    - Calculate frequency of each A-B pair
    - Compare against expected frequency (baseline)
    - Flag pairs that occur significantly above baseline
    - Minimum 10 logs required for meaningful detection
    """
```

### 3. Consequence Reinforcement Analysis
```python
def analyze_reinforcement_patterns(logs: list[ABCLog]) -> ReinforcementAnalysis:
    """
    Determine if behaviors are being inadvertently reinforced.
    - Track behavior frequency over time following specific consequences
    - Identify if behavior increases after certain consequences (positive reinforcement)
    - Identify if behavior increases when something is removed (negative reinforcement)
    - Calculate reinforcement ratio (how often the behavior is followed by reinforcement)
    """
```

### 4. Temporal Correlation
```python
def analyze_temporal_patterns(logs: list[ABCLog]) -> TemporalAnalysis:
    """
    Find time-of-day and day-of-week correlations.
    - Heatmap data: behavior frequency by hour and day
    - Peak behavior windows
    - Trend direction (increasing, decreasing, stable)
    - Seasonality detection (if sufficient data)
    """
```

### 5. Multi-Pet Correlation (Phase 2)
```python
def analyze_inter_pet_dynamics(
    logs: list[ABCLog],
    interactions: list[Interaction]
) -> MultiPetAnalysis:
    """
    Correlate individual pet behaviors with multi-pet context.
    - Behavior frequency when specific other pets are present vs absent
    - Resource guarding hotspot identification
    - Interaction escalation patterns
    - Household harmony score calculation
    """
```

### 6. Progress Metrics
```python
def calculate_progress(
    logs: list[ABCLog],
    bip: BIP,
    period: str = "week"
) -> ProgressMetrics:
    """
    Calculate progress metrics for a behavior intervention plan.
    - Target behavior frequency trend (is it decreasing?)
    - Replacement behavior adoption rate
    - Days since last incident
    - Rolling average comparison (this week vs last week)
    - Phase advancement readiness assessment
    """
```

## Data Preparation for AI

### Formatting Logs for Claude Prompts
```python
def format_logs_for_ai(logs: list[ABCLog], max_logs: int = 50) -> str:
    """
    Format ABC logs into a structured text block for AI prompt injection.
    - Most recent logs first
    - Include antecedent, behavior, consequence, timestamp, severity
    - Truncate to max_logs to stay within token limits
    - Include summary statistics alongside raw data
    """
```

### Pre-Analysis Summary
```python
def generate_pre_analysis_summary(logs: list[ABCLog]) -> dict:
    """
    Generate a quantitative summary to prepend to AI prompts.
    This gives Claude structured data context before the raw logs.
    Output:
    {
        "total_logs": int,
        "date_range": {"start": str, "end": str},
        "top_behaviors": [{"behavior": str, "count": int, "pct": float}],
        "top_antecedents": [{"antecedent": str, "count": int, "pct": float}],
        "top_consequences": [{"consequence": str, "count": int, "pct": float}],
        "severity_avg": float,
        "severity_trend": "increasing" | "decreasing" | "stable",
        "peak_hours": [int],
        "other_pets_involvement_rate": float
    }
    """
```

## Chart Data Preparation

### Behavior Frequency Chart
```python
def prepare_frequency_chart_data(logs, period="day", days=30) -> list[dict]:
    """Returns [{date: str, count: int, severity_avg: float}, ...]"""
```

### Antecedent Distribution Chart
```python
def prepare_antecedent_pie_data(logs) -> list[dict]:
    """Returns [{category: str, count: int, percentage: float}, ...]"""
```

### Progress Over Time Chart
```python
def prepare_progress_line_data(logs, bip, weeks=12) -> list[dict]:
    """Returns [{week: str, target_behavior_count: int, replacement_count: int}, ...]"""
```

## Thresholds and Constants
```python
# Minimum logs before pattern detection activates
MIN_LOGS_FOR_PATTERNS = 10

# Minimum logs before function assessment
MIN_LOGS_FOR_FUNCTION = 15

# Pattern significance threshold (co-occurrence ratio)
PATTERN_SIGNIFICANCE = 0.3  # 30% of logs share this A-B pair

# Severity trend window (days)
TREND_WINDOW_DAYS = 14

# Progress improvement threshold
IMPROVEMENT_THRESHOLD = 0.2  # 20% reduction = improvement

# Reinforcement detection threshold
REINFORCEMENT_RATIO = 0.5  # Behavior followed by reinforcement >50% of the time
```

## Performance Considerations
- Cache aggregated results for 1 hour (invalidate on new log entry)
- Limit analysis to last 90 days of logs by default
- Use database-level aggregations (SQL GROUP BY) where possible before loading into Pandas
- Run heavy analytics jobs asynchronously via Celery workers
- Pre-compute daily/weekly summaries in progress_snapshots table
