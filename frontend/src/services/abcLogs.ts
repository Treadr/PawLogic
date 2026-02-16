import { api } from './api';
import type { ABCLog, ABCLogCreate, ABCLogSummary, Taxonomy } from '../types';

export async function createABCLog(data: ABCLogCreate): Promise<ABCLog> {
  return api.post<ABCLog>('/abc-logs', data);
}

export async function listABCLogs(petId: string, limit = 50, offset = 0): Promise<ABCLog[]> {
  return api.get<ABCLog[]>(`/abc-logs?pet_id=${petId}&limit=${limit}&offset=${offset}`);
}

export async function getABCLog(logId: string): Promise<ABCLog> {
  return api.get<ABCLog>(`/abc-logs/${logId}`);
}

export async function deleteABCLog(logId: string): Promise<void> {
  return api.delete<void>(`/abc-logs/${logId}`);
}

export async function getABCLogSummary(petId: string): Promise<ABCLogSummary> {
  return api.get<ABCLogSummary>(`/abc-logs/summary?pet_id=${petId}`);
}

export async function getTaxonomy(species: string): Promise<Taxonomy> {
  return api.get<Taxonomy>(`/abc-logs/taxonomy/${species}`);
}
