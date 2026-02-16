import { api } from './api';
import type { PatternResult, CoachingResult } from '../types';

export async function detectPatterns(petId: string): Promise<PatternResult> {
  return api.post<PatternResult>(`/analysis/detect-patterns?pet_id=${petId}`, {});
}

export async function askCoaching(petId: string, question: string): Promise<CoachingResult> {
  return api.post<CoachingResult>('/analysis/coaching', { pet_id: petId, question });
}
