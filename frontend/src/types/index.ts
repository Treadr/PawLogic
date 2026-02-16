// ── Pet ──────────────────────────────────────────────
export type Species = 'cat' | 'dog';
export type Sex = 'male' | 'female' | 'unknown';

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: Species;
  breed: string | null;
  age_years: number | null;
  age_months: number | null;
  weight_lbs: number | null;
  sex: Sex;
  is_neutered: boolean;
  temperament: string[] | null;
  medical_notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PetCreate {
  name: string;
  species: Species;
  breed?: string;
  age_years?: number;
  age_months?: number;
  weight_lbs?: number;
  sex?: Sex;
  is_neutered?: boolean;
  temperament?: string[];
  medical_notes?: string;
}

export interface PetUpdate {
  name?: string;
  breed?: string;
  age_years?: number;
  age_months?: number;
  weight_lbs?: number;
  sex?: Sex;
  is_neutered?: boolean;
  temperament?: string[];
  medical_notes?: string;
}

// ── ABC Log ──────────────────────────────────────────
export interface ABCLog {
  id: string;
  pet_id: string;
  user_id: string;
  antecedent_category: string;
  antecedent_tags: string[];
  antecedent_notes: string | null;
  behavior_category: string;
  behavior_tags: string[];
  behavior_severity: number;
  behavior_notes: string | null;
  consequence_category: string;
  consequence_tags: string[];
  consequence_notes: string | null;
  occurred_at: string;
  location: string | null;
  duration_seconds: number | null;
  other_pets_present: string[];
  created_at: string;
}

export interface ABCLogCreate {
  pet_id: string;
  antecedent_category: string;
  antecedent_tags: string[];
  antecedent_notes?: string;
  behavior_category: string;
  behavior_tags: string[];
  behavior_severity: number;
  behavior_notes?: string;
  consequence_category: string;
  consequence_tags: string[];
  consequence_notes?: string;
  occurred_at?: string;
  location?: string;
  duration_seconds?: number;
  other_pets_present?: string[];
}

export interface ABCLogSummary {
  total_logs: number;
  earliest_log: string | null;
  latest_log: string | null;
  severity_avg: number | null;
  top_behaviors: { category: string; count: number }[];
  top_antecedents: { category: string; count: number }[];
}

export interface Taxonomy {
  species: string;
  antecedent_categories: Record<string, string[]>;
  behavior_categories: Record<string, string[]>;
  consequence_categories: Record<string, string[]>;
}

// ── Insight ──────────────────────────────────────────
export type InsightType = 'pattern' | 'function' | 'correlation' | 'recommendation';
export type BehaviorFunction = 'attention' | 'escape' | 'tangible' | 'sensory';

export interface Insight {
  id: string;
  pet_id: string;
  user_id: string;
  insight_type: InsightType;
  title: string;
  body: string;
  confidence: number | null;
  abc_log_ids: string[] | null;
  behavior_function: BehaviorFunction | null;
  is_read: boolean;
  created_at: string;
}

export interface InsightSummary {
  total: number;
  unread: number;
}

// ── Analysis ─────────────────────────────────────────
export interface PatternResult {
  pet_id: string;
  logs_analyzed: number;
  patterns_found: number;
  patterns: {
    title: string;
    body: string;
    insight_type: string;
    confidence: number;
    behavior_function: string | null;
  }[];
}

export interface CoachingResult {
  pet_id: string;
  question: string;
  response: string;
  model: string;
  log_count: number;
}

// ── Progress ─────────────────────────────────────────
export interface FrequencyData {
  pet_id: string;
  days: number;
  data: { date: string; count: number }[];
}

export interface SeverityTrendData {
  pet_id: string;
  days: number;
  data: { date: string; avg_severity: number; max_severity: number }[];
}

export interface CategoryBreakdown {
  pet_id: string;
  days: number;
  behaviors: { category: string; count: number }[];
  antecedents: { category: string; count: number }[];
  consequences: { category: string; count: number }[];
}

export interface DashboardData {
  pet_id: string;
  total_logs: number;
  recent_7d: number;
  previous_7d: number;
  trend_pct: number;
  avg_severity: number | null;
  pattern_detection_ready: boolean;
}
