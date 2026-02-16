export interface ABCLog {
  id: string;
  pet_id: string;
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
