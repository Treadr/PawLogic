import { api } from './api';
import type { FrequencyData, SeverityTrendData, CategoryBreakdown, DashboardData } from '../types';

export async function getBehaviorFrequency(petId: string, days = 30): Promise<FrequencyData> {
  return api.get<FrequencyData>(`/progress/frequency?pet_id=${petId}&days=${days}`);
}

export async function getSeverityTrend(petId: string, days = 30): Promise<SeverityTrendData> {
  return api.get<SeverityTrendData>(`/progress/severity-trend?pet_id=${petId}&days=${days}`);
}

export async function getCategoryBreakdown(petId: string, days = 30): Promise<CategoryBreakdown> {
  return api.get<CategoryBreakdown>(`/progress/category-breakdown?pet_id=${petId}&days=${days}`);
}

export async function getDashboard(petId: string): Promise<DashboardData> {
  return api.get<DashboardData>(`/progress/dashboard?pet_id=${petId}`);
}
