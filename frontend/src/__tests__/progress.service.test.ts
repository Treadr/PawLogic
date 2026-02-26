import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getBehaviorFrequency,
  getSeverityTrend,
  getCategoryBreakdown,
  getDashboard,
} from '../services/progress';

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  setAuthToken: vi.fn(),
  getAuthToken: vi.fn(),
}));

import { api } from '../services/api';
const mockGet = api.get as ReturnType<typeof vi.fn>;

describe('progress service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBehaviorFrequency', () => {
    it('calls the correct endpoint with default days=30', async () => {
      const payload = { pet_id: 'p1', days: 30, data: [] };
      mockGet.mockResolvedValueOnce(payload);

      const result = await getBehaviorFrequency('p1');

      expect(mockGet).toHaveBeenCalledWith('/progress/frequency?pet_id=p1&days=30');
      expect(result).toEqual(payload);
    });

    it('forwards a custom days param', async () => {
      mockGet.mockResolvedValueOnce({ pet_id: 'p1', days: 7, data: [] });

      await getBehaviorFrequency('p1', 7);

      expect(mockGet).toHaveBeenCalledWith('/progress/frequency?pet_id=p1&days=7');
    });

    it('propagates API errors to the caller', async () => {
      mockGet.mockRejectedValueOnce(new Error('Unauthorized'));
      await expect(getBehaviorFrequency('p1')).rejects.toThrow('Unauthorized');
    });
  });

  describe('getSeverityTrend', () => {
    it('calls the correct endpoint with default days=30', async () => {
      const payload = { pet_id: 'p1', days: 30, data: [] };
      mockGet.mockResolvedValueOnce(payload);

      const result = await getSeverityTrend('p1');

      expect(mockGet).toHaveBeenCalledWith('/progress/severity-trend?pet_id=p1&days=30');
      expect(result).toEqual(payload);
    });

    it('forwards a custom days param', async () => {
      mockGet.mockResolvedValueOnce({ pet_id: 'p1', days: 90, data: [] });

      await getSeverityTrend('p1', 90);

      expect(mockGet).toHaveBeenCalledWith('/progress/severity-trend?pet_id=p1&days=90');
    });
  });

  describe('getCategoryBreakdown', () => {
    it('calls the correct endpoint with default days=30', async () => {
      const payload = {
        pet_id: 'p1',
        days: 30,
        behaviors: [{ category: 'scratches_couch', count: 7 }],
        antecedents: [],
        consequences: [],
      };
      mockGet.mockResolvedValueOnce(payload);

      const result = await getCategoryBreakdown('p1');

      expect(mockGet).toHaveBeenCalledWith(
        '/progress/category-breakdown?pet_id=p1&days=30',
      );
      expect(result).toEqual(payload);
    });
  });

  describe('getDashboard', () => {
    it('calls the correct endpoint', async () => {
      const payload = {
        pet_id: 'p1',
        total_logs: 42,
        recent_7d: 10,
        previous_7d: 8,
        trend_pct: 25,
        avg_severity: 2.1,
        pattern_detection_ready: true,
      };
      mockGet.mockResolvedValueOnce(payload);

      const result = await getDashboard('p1');

      expect(mockGet).toHaveBeenCalledWith('/progress/dashboard?pet_id=p1');
      expect(result).toEqual(payload);
    });

    it('propagates API errors', async () => {
      mockGet.mockRejectedValueOnce(new Error('Not Found'));
      await expect(getDashboard('p1')).rejects.toThrow('Not Found');
    });
  });
});
