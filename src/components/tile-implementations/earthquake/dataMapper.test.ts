import { describe, it, expect } from 'vitest';

import { MockResponseData } from '../../../test/mocks/endpointMocks';

import { earthquakeDataMapper } from './dataMapper';

describe('earthquakeDataMapper', () => {
  describe('validate', () => {
    it('should validate correct API response', () => {
      const validResponse = MockResponseData.getEarthquakeData();
      expect(earthquakeDataMapper.validate(validResponse)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(earthquakeDataMapper.validate(null)).toBe(false);
      expect(earthquakeDataMapper.validate(undefined)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(earthquakeDataMapper.validate('string')).toBe(false);
      expect(earthquakeDataMapper.validate(123)).toBe(false);
    });

    it('should reject response without features array', () => {
      expect(earthquakeDataMapper.validate({})).toBe(false);
      expect(earthquakeDataMapper.validate({ features: 'not an array' })).toBe(false);
    });
  });

  describe('map', () => {
    it('should map valid API response to tile data', () => {
      const apiResponse = MockResponseData.getEarthquakeData();
      const result = earthquakeDataMapper.map(apiResponse);

      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('should map earthquake features correctly', () => {
      const apiResponse = MockResponseData.getEarthquakeData();
      const result = earthquakeDataMapper.map(apiResponse);

      if (result.items.length > 0) {
        const item = result.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('place');
        expect(item).toHaveProperty('magnitude');
        expect(item).toHaveProperty('time');
        expect(item).toHaveProperty('coordinates');
        expect(typeof item.magnitude).toBe('number');
        expect(Array.isArray(item.coordinates)).toBe(true);
      }
    });

    it('should throw error for invalid response', () => {
      expect(() => earthquakeDataMapper.map(null as never)).toThrow(
        'Invalid EarthquakeApiResponse',
      );
    });
  });

  describe('safeMap', () => {
    it('should successfully map valid response', () => {
      const apiResponse = MockResponseData.getEarthquakeData();
      const result = earthquakeDataMapper.safeMap(apiResponse);

      expect(result).toHaveProperty('items');
    });

    it('should throw error for invalid response', () => {
      expect(() => earthquakeDataMapper.safeMap(null as never)).toThrow(
        'Failed to map earthquake data',
      );
    });
  });
});
