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

export interface CoachingResult {
  pet_id: string;
  question: string;
  response: string;
  model: string;
  log_count: number;
}

export async function detectPatterns(petId: string): Promise<PatternResult> {
  return api.post<PatternResult>(`/analysis/detect-patterns?pet_id=${petId}`, {});
}

export async function askCoaching(
  petId: string,
  question: string,
): Promise<CoachingResult> {
  return api.post<CoachingResult>('/analysis/coaching', {
    pet_id: petId,
    question,
  });
}
