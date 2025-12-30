import { describe, it, expect } from 'vitest';

import { MockResponseData } from '../../../test/mocks/endpointMocks';

import { PreciousMetalsDataMapper } from './dataMapper';

describe('PreciousMetalsDataMapper', () => {
  const mapper = new PreciousMetalsDataMapper();

  describe('validate', () => {
    it('should validate correct API response', () => {
      const validResponse = MockResponseData.getPreciousMetalsData();
      expect(mapper.validate(validResponse)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(mapper.validate(null)).toBe(false);
      expect(mapper.validate(undefined)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(mapper.validate('string')).toBe(false);
      expect(mapper.validate(123)).toBe(false);
    });

    it('should reject response without gold', () => {
      expect(mapper.validate({ silver: { price: 23.45 } })).toBe(false);
    });

    it('should reject response without silver', () => {
      expect(mapper.validate({ gold: { price: 3350.7 } })).toBe(false);
    });

    it('should reject response with invalid gold price', () => {
      expect(
        mapper.validate({
          gold: { price: 'invalid' },
          silver: { price: 23.45 },
        }),
      ).toBe(false);
    });

    it('should accept response with missing change_24h', () => {
      const response = {
        gold: { price: 3350.7 },
        silver: { price: 23.45 },
      };
      expect(mapper.validate(response)).toBe(true);
    });
  });

  describe('map', () => {
    it('should map valid API response to tile data', () => {
      const apiResponse = MockResponseData.getPreciousMetalsData();
      const result = mapper.map(apiResponse);

      expect(result).toHaveProperty('gold');
      expect(result).toHaveProperty('silver');
      expect(result.gold).toHaveProperty('price');
      expect(result.silver).toHaveProperty('price');
      expect(typeof result.gold.price).toBe('number');
      expect(typeof result.silver.price).toBe('number');
    });

    it('should preserve all gold and silver properties', () => {
      const apiResponse = MockResponseData.getPreciousMetalsData();
      const result = mapper.map(apiResponse);

      expect(result.gold.price).toBe(apiResponse.gold.price);
      expect(result.silver.price).toBe(apiResponse.silver.price);
      if (apiResponse.gold.change_24h !== undefined) {
        expect(result.gold.change_24h).toBe(apiResponse.gold.change_24h);
      }
      if (apiResponse.silver.change_24h !== undefined) {
        expect(result.silver.change_24h).toBe(apiResponse.silver.change_24h);
      }
    });
  });

  describe('safeMap', () => {
    it('should successfully map valid response', () => {
      const apiResponse = MockResponseData.getPreciousMetalsData();
      const result = mapper.safeMap(apiResponse);

      expect(result).toHaveProperty('gold');
      expect(result).toHaveProperty('silver');
    });

    it('should throw error for invalid response', () => {
      expect(() => mapper.safeMap(null)).toThrow('Invalid API response format');
      expect(() => mapper.safeMap({})).toThrow('Invalid API response format');
    });
  });
});
