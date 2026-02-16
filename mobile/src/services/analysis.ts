import { api } from './api';

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

export async function detectPatterns(petId: string): Promise<PatternResult> {
  return api.post<PatternResult>(`/analysis/detect-patterns?pet_id=${petId}`, {});
}
