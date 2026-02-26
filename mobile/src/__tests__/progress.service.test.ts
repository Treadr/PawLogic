import {
  getBehaviorFrequency,
  getSeverityTrend,
  getCategoryBreakdown,
  getDashboard,
} from '../services/progress';

jest.mock('../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  setAuthToken: jest.fn(),
}));

import { api } from '../services/api';
const mockGet = api.get as jest.Mock;

describe('progress service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBehaviorFrequency', () => {
    it('hits the correct endpoint with default days=30', async () => {
      const payload = { pet_id: 'pet-1', days: 30, data: [] };
      mockGet.mockResolvedValueOnce(payload);

      const result = await getBehaviorFrequency('pet-1');

      expect(mockGet).toHaveBeenCalledWith('/progress/frequency?pet_id=pet-1&days=30');
      expect(result).toEqual(payload);
    });

    it('forwards a custom days param', async () => {
      mockGet.mockResolvedValueOnce({ pet_id: 'pet-1', days: 7, data: [] });

      await getBehaviorFrequency('pet-1', 7);

      expect(mockGet).toHaveBeenCalledWith('/progress/frequency?pet_id=pet-1&days=7');
    });

    it('propagates errors from the api layer', async () => {
      mockGet.mockRejectedValueOnce(new Error('network error'));
      await expect(getBehaviorFrequency('pet-1')).rejects.toThrow('network error');
    });
  });

  describe('getSeverityTrend', () => {
    it('hits the correct endpoint with default days=30', async () => {
      const payload = { pet_id: 'pet-1', days: 30, data: [] };
      mockGet.mockResolvedValueOnce(payload);

      const result = await getSeverityTrend('pet-1');

      expect(mockGet).toHaveBeenCalledWith('/progress/severity-trend?pet_id=pet-1&days=30');
      expect(result).toEqual(payload);
    });

    it('forwards a custom days param', async () => {
      mockGet.mockResolvedValueOnce({ pet_id: 'pet-1', days: 14, data: [] });

      await getSeverityTrend('pet-1', 14);

      expect(mockGet).toHaveBeenCalledWith('/progress/severity-trend?pet_id=pet-1&days=14');
    });
  });

  describe('getCategoryBreakdown', () => {
    it('hits the correct endpoint with default days=30', async () => {
      const payload = {
        pet_id: 'pet-1',
        days: 30,
        behaviors: [],
        antecedents: [],
        consequences: [],
      };
      mockGet.mockResolvedValueOnce(payload);

      const result = await getCategoryBreakdown('pet-1');

      expect(mockGet).toHaveBeenCalledWith(
        '/progress/category-breakdown?pet_id=pet-1&days=30',
      );
      expect(result).toEqual(payload);
    });
  });

  describe('getDashboard', () => {
    it('hits the correct endpoint', async () => {
      const payload = {
        pet_id: 'pet-1',
        total_logs: 25,
        recent_7d: 6,
        previous_7d: 4,
        trend_pct: 50,
        avg_severity: 2.4,
        pattern_detection_ready: true,
      };
      mockGet.mockResolvedValueOnce(payload);

      const result = await getDashboard('pet-1');

      expect(mockGet).toHaveBeenCalledWith('/progress/dashboard?pet_id=pet-1');
      expect(result).toEqual(payload);
    });
  });
});
