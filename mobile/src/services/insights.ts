import { api } from './api';
import type { Insight } from '../types';

export interface InsightSummary {
  total: number;
  unread: number;
}

export async function listInsights(
  petId: string,
  unreadOnly = false,
): Promise<Insight[]> {
  const params = unreadOnly ? '?unread_only=true' : '';
  return api.get<Insight[]>(`/pets/${petId}/insights${params}`);
}

export async function getInsightSummary(petId: string): Promise<InsightSummary> {
  return api.get<InsightSummary>(`/pets/${petId}/insights/summary`);
}

export async function getInsight(insightId: string): Promise<Insight> {
  return api.get<Insight>(`/insights/${insightId}`);
}

export async function markInsightRead(
  insightId: string,
  isRead = true,
): Promise<Insight> {
  return api.patch<Insight>(`/insights/${insightId}`, { is_read: isRead });
}
