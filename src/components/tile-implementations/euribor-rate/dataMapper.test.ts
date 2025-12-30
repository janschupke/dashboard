import { describe, it, expect } from 'vitest';

import { MockResponseData } from '../../../test/mocks/endpointMocks';

import { ecbEuriborDataMapper } from './dataMapper';

describe('ecbEuriborDataMapper', () => {
  describe('validate', () => {
    it('should validate correct API response', () => {
      const validResponse = MockResponseData.getEuriborRateData();
      expect(ecbEuriborDataMapper.validate(validResponse)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(ecbEuriborDataMapper.validate(null)).toBe(false);
      expect(ecbEuriborDataMapper.validate(undefined)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(ecbEuriborDataMapper.validate('string')).toBe(false);
      expect(ecbEuriborDataMapper.validate(123)).toBe(false);
    });

    it('should reject response without dataSets', () => {
      expect(ecbEuriborDataMapper.validate({ structure: {} })).toBe(false);
    });

    it('should reject response without structure', () => {
      expect(ecbEuriborDataMapper.validate({ dataSets: [] })).toBe(false);
    });
  });

  describe('map', () => {
    it('should map valid API response to tile data', () => {
      const apiResponse = MockResponseData.getEuriborRateData();
      const result = ecbEuriborDataMapper.map(apiResponse);

      expect(result).toHaveProperty('currentRate');
      expect(result).toHaveProperty('lastUpdate');
      expect(result).toHaveProperty('historicalData');
      expect(typeof result.currentRate).toBe('number');
      expect(result.lastUpdate).toBeInstanceOf(Date);
      expect(Array.isArray(result.historicalData)).toBe(true);
    });

    it('should use latest observation for currentRate', () => {
      const apiResponse = MockResponseData.getEuriborRateData();
      const result = ecbEuriborDataMapper.map(apiResponse);

      // Should use the last observation (index 1 in mock data)
      expect(result.currentRate).toBe(3.85);
    });

    it('should sort historical data by date', () => {
      const apiResponse = MockResponseData.getEuriborRateData();
      const result = ecbEuriborDataMapper.map(apiResponse);

      if (result.historicalData.length > 1) {
        const dates = result.historicalData.map((entry) => entry.date.getTime());
        const sortedDates = [...dates].sort((a, b) => a - b);
        expect(dates).toEqual(sortedDates);
      }
    });
  });

  describe('safeMap', () => {
    it('should successfully map valid response', () => {
      const apiResponse = MockResponseData.getEuriborRateData();
      const result = ecbEuriborDataMapper.safeMap(apiResponse);

      expect(result).toHaveProperty('currentRate');
      expect(result).toHaveProperty('lastUpdate');
      expect(result).toHaveProperty('historicalData');
    });

    it('should throw error for invalid response', () => {
      expect(() => ecbEuriborDataMapper.safeMap(null as never)).toThrow(
        'Failed to map Euribor rate data',
      );
    });
  });
});
