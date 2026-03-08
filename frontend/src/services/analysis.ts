import { api } from './api';
import type { PatternResult, CoachingResult, CoachingSession, CoachingSessionDetail } from '../types';

export async function detectPatterns(petId: string): Promise<PatternResult> {
  return api.post<PatternResult>(`/analysis/detect-patterns?pet_id=${petId}`, {});
}

export async function askCoaching(petId: string, question: string, sessionId?: string): Promise<CoachingResult> {
  return api.post<CoachingResult>('/analysis/coaching', {
    pet_id: petId,
    question,
    session_id: sessionId ?? null,
  });
}

export async function listSessions(petId: string): Promise<CoachingSession[]> {
  return api.get<CoachingSession[]>(`/analysis/coaching/sessions?pet_id=${petId}`);
}

export async function getSession(sessionId: string): Promise<CoachingSessionDetail> {
  return api.get<CoachingSessionDetail>(`/analysis/coaching/sessions/${sessionId}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  return api.delete(`/analysis/coaching/sessions/${sessionId}`);
}
