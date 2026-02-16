export type InsightType = 'pattern' | 'function' | 'correlation' | 'recommendation';
export type BehaviorFunction = 'attention' | 'escape' | 'tangible' | 'sensory';

export interface Insight {
  id: string;
  pet_id: string;
  insight_type: InsightType;
  title: string;
  body: string;
  confidence: number;
  behavior_function: BehaviorFunction | null;
  is_read: boolean;
  created_at: string;
}
