import { api } from './api';
import type { Insight, InsightSummary } from '../types';

export async function listInsights(petId: string, unreadOnly = false): Promise<Insight[]> {
  return api.get<Insight[]>(`/pets/${petId}/insights?unread_only=${unreadOnly}`);
}

export async function getInsightSummary(petId: string): Promise<InsightSummary> {
  return api.get<InsightSummary>(`/pets/${petId}/insights/summary`);
}

export async function getInsight(insightId: string): Promise<Insight> {
  return api.get<Insight>(`/insights/${insightId}`);
}

export async function markInsightRead(insightId: string, isRead = true): Promise<Insight> {
  return api.patch<Insight>(`/insights/${insightId}`, { is_read: isRead });
}
