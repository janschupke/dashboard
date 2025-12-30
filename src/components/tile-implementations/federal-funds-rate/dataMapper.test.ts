import { describe, it, expect } from 'vitest';

import { MockResponseData } from '../../../test/mocks/endpointMocks';

import { FederalFundsRateDataMapper } from './dataMapper';

import type { FederalFundsRateApiResponse } from './types';

describe('FederalFundsRateDataMapper', () => {
  const mapper = new FederalFundsRateDataMapper();

  describe('validate', () => {
    it('should validate correct API response', () => {
      const validResponse = MockResponseData.getFederalFundsRateData();
      expect(mapper.validate(validResponse)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(mapper.validate(null)).toBe(false);
      expect(mapper.validate(undefined)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(mapper.validate('string')).toBe(false);
      expect(mapper.validate(123)).toBe(false);
      expect(mapper.validate([])).toBe(false);
    });

    it('should reject response without observations', () => {
      expect(mapper.validate({})).toBe(false);
      expect(mapper.validate({ other: 'data' })).toBe(false);
    });

    it('should reject response with non-array observations', () => {
      expect(mapper.validate({ observations: 'not an array' })).toBe(false);
      expect(mapper.validate({ observations: null })).toBe(false);
    });

    it('should reject empty observations array', () => {
      expect(mapper.validate({ observations: [] })).toBe(false);
    });

    it('should reject observations missing required fields', () => {
      expect(
        mapper.validate({
          observations: [
            {
              realtime_start: '2024-01-15',
              realtime_end: '2024-01-15',
              date: '2024-01-15',
              // missing value
            },
          ],
        }),
      ).toBe(false);
    });

    it('should reject observations with wrong field types', () => {
      expect(
        mapper.validate({
          observations: [
            {
              realtime_start: 123, // should be string
              realtime_end: '2024-01-15',
              date: '2024-01-15',
              value: '5.50',
            },
          ],
        }),
      ).toBe(false);
    });
  });

  describe('map', () => {
    it('should map valid API response to tile data', () => {
      const apiResponse = MockResponseData.getFederalFundsRateData();
      const result = mapper.map(apiResponse);

      expect(result).toHaveProperty('currentRate');
      expect(result).toHaveProperty('lastUpdate');
      expect(result).toHaveProperty('historicalData');
      expect(typeof result.currentRate).toBe('number');
      expect(result.currentRate).toBe(5.5);
      expect(result.lastUpdate).toBeInstanceOf(Date);
      expect(Array.isArray(result.historicalData)).toBe(true);
      expect(result.historicalData.length).toBe(2);
    });

    it('should use the latest observation for currentRate', () => {
      const apiResponse: FederalFundsRateApiResponse = {
        observations: [
          {
            realtime_start: '2024-01-14',
            realtime_end: '2024-01-14',
            date: '2024-01-14',
            value: '5.25',
          },
          {
            realtime_start: '2024-01-15',
            realtime_end: '2024-01-15',
            date: '2024-01-15',
            value: '5.50',
          },
        ],
      };

      const result = mapper.map(apiResponse);
      expect(result.currentRate).toBe(5.5);
      expect(result.lastUpdate).toEqual(new Date('2024-01-15'));
    });

    it('should map all observations to historicalData', () => {
      const apiResponse = MockResponseData.getFederalFundsRateData();
      const result = mapper.map(apiResponse);

      expect(result.historicalData).toHaveLength(2);
      expect(result.historicalData[0]).toEqual({
        date: new Date('2024-01-15'),
        rate: 5.5,
      });
      expect(result.historicalData[1]).toEqual({
        date: new Date('2024-01-14'),
        rate: 5.5,
      });
    });

    it('should throw error when no observations available', () => {
      const apiResponse: FederalFundsRateApiResponse = {
        observations: [],
      };

      expect(() => mapper.map(apiResponse as never)).toThrow('No observations available');
    });
  });

  describe('safeMap', () => {
    it('should successfully map valid response', () => {
      const apiResponse = MockResponseData.getFederalFundsRateData();
      const result = mapper.safeMap(apiResponse);

      expect(result).toHaveProperty('currentRate');
      expect(result).toHaveProperty('lastUpdate');
      expect(result).toHaveProperty('historicalData');
    });

    it('should throw error for invalid response', () => {
      expect(() => mapper.safeMap(null)).toThrow('Invalid API response format');
      expect(() => mapper.safeMap({})).toThrow('Invalid API response format');
    });

    it('should throw error when mapping fails', () => {
      const invalidResponse = { observations: [] };
      // Empty observations array fails validation, not mapping
      expect(() => mapper.safeMap(invalidResponse)).toThrow('Invalid API response format');
    });
  });
});
