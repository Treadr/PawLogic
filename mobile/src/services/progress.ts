import { api } from './api';

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

export async function getBehaviorFrequency(
  petId: string,
  days = 30,
): Promise<FrequencyData> {
  return api.get<FrequencyData>(`/progress/frequency?pet_id=${petId}&days=${days}`);
}

export async function getSeverityTrend(
  petId: string,
  days = 30,
): Promise<SeverityTrendData> {
  return api.get<SeverityTrendData>(`/progress/severity-trend?pet_id=${petId}&days=${days}`);
}

export async function getCategoryBreakdown(
  petId: string,
  days = 30,
): Promise<CategoryBreakdown> {
  return api.get<CategoryBreakdown>(`/progress/category-breakdown?pet_id=${petId}&days=${days}`);
}

export async function getDashboard(petId: string): Promise<DashboardData> {
  return api.get<DashboardData>(`/progress/dashboard?pet_id=${petId}`);
}
