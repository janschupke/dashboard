import { describe, it, expect, beforeAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTimeApi } from './useTimeApi';
import './dataMapper';
import {
  EndpointTestUtils,
  API_ENDPOINTS,
  setupTimeSuccessMock,
  setupSuccessMock,
  setupDelayedMock,
  setupFailureMock,
} from '../../../test/utils/endpointTestUtils';
import type { TimeParams } from '../../../services/apiEndpoints';
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import { TimeDataMapper } from './dataMapper';
import { TileType } from '../../../types/tile';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ mapperRegistry }) => {
      mapperRegistry.register(TileType.TIME_TAIPEI, new TimeDataMapper());
    }}
  >
    {children}
  </MockDataServicesProvider>
);

beforeAll(() => {
  // registerTimeDataMapper(); // This line is removed as per the new_code
});

describe('useTimeApi', () => {
  const mockTileId = 'test-time-tile';
  const berlinParams: TimeParams = {
    lat: 52.52,
    lng: 13.405,
    by: 'position',
    format: 'json',
  };
  const newYorkParams: TimeParams = {
    lat: 40.7128,
    lng: -74.006,
    by: 'position',
    format: 'json',
  };
  const londonParams: TimeParams = {
    lat: 51.5074,
    lng: -0.1278,
    by: 'position',
    format: 'json',
  };
  const chicagoParams: TimeParams = {
    lat: 41.8781,
    lng: -87.6298,
    by: 'position',
    format: 'json',
  };

  describe('getTime - Success Scenarios', () => {
    it('should successfully fetch time data', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupTimeSuccessMock();
      const { result } = renderHook(() => useTimeApi(), { wrapper });

      // Act
      const fetchResult = await result.current.getTime(mockTileId, berlinParams);

      // Assert
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('data');
      expect(fetchResult).toHaveProperty('lastDataRequest');
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
      expect(typeof fetchResult.lastDataRequest).toBe('number');

      const data = fetchResult.data;
      // Instead of expect(data).toBeNull(), check the mapped values
      expect(data).toBeDefined();
      expect(data?.currentTime).toBe('14:30:25');
      expect(data?.timezone).toBe('Europe/Berlin');
      expect(data?.abbreviation).toBe('CET');
      expect(data?.offset).toBe('+01:00');
    });

    it('should handle delayed response', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      const delayedApiData = {
        status: 'OK',
        message: '',
        countryCode: 'DE',
        zoneName: 'Europe/Berlin',
        abbreviation: 'CET',
        gmtOffset: 3600,
        dst: '0',
        timestamp: 1705329025,
        formatted: '2024-01-15 14:30:25',
      };
      setupDelayedMock('/api/timezonedb/v2.1/get-time-zone', delayedApiData, 50);
      const { result } = renderHook(() => useTimeApi(), { wrapper });
      // Act & Assert
      await waitFor(async () => {
        const fetchResult = await result.current.getTime(mockTileId, berlinParams);
        expect(fetchResult).toBeDefined();
        const data = fetchResult.data;
        expect(data).toBeDefined();
        expect(data?.currentTime).toBe('14:30:25');
        expect(data?.timezone).toBe('Europe/Berlin');
        expect(data?.abbreviation).toBe('CET');
        expect(data?.offset).toBe('+01:00');
      });
    });
  });

  describe('getTime - Failure Scenarios', () => {
    it('should handle network errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TIME_API, 'network');
      const { result } = renderHook(() => useTimeApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getTime(mockTileId, berlinParams);
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful', false);
      expect(fetchResult.lastDataRequest).toBeDefined();
      expect(typeof fetchResult.lastDataRequest).toBe('number');
    });

    it('should handle timeout errors', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TIME_API, 'timeout');
      const { result } = renderHook(() => useTimeApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getTime(mockTileId, berlinParams);
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful', false);
      expect(fetchResult.lastDataRequest).toBeDefined();
      expect(typeof fetchResult.lastDataRequest).toBe('number');
    });

    it('should handle API errors (500)', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TIME_API, 'api');
      const { result } = renderHook(() => useTimeApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getTime(mockTileId, berlinParams);
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful', false);
      expect(fetchResult.lastDataRequest).toBeDefined();
      expect(typeof fetchResult.lastDataRequest).toBe('number');
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.TIME_API, 'malformed');
      const { result } = renderHook(() => useTimeApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getTime(mockTileId, berlinParams);
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful', false);
      expect(fetchResult.lastDataRequest).toBeDefined();
      expect(typeof fetchResult.lastDataRequest).toBe('number');
    });
  });

  describe('getTime - Edge Cases', () => {
    it('should handle business hours data', async () => {
      // Arrange
      const businessHoursApiData = {
        status: 'OK',
        message: '',
        countryCode: 'US',
        zoneName: 'America/New_York',
        abbreviation: 'EST',
        gmtOffset: -18000,
        dst: '0',
        timestamp: 1705331400,
        formatted: '2024-01-15 14:30:00',
      };
      EndpointTestUtils.clearMocks();
      setupSuccessMock('/api/timezonedb/v2.1/get-time-zone', businessHoursApiData);
      const { result } = renderHook(() => useTimeApi(), { wrapper });
      // Act
      const fetchResult = await result.current.getTime(mockTileId, newYorkParams);
      const data = fetchResult.data;
      // Assert
      expect(data).toBeDefined();
      expect(data?.isBusinessHours).toBe(true);
      expect(['open', 'closed', 'opening soon', 'closing soon']).toContain(data?.businessStatus);
      expect(data?.timezone).toBe('America/New_York');
      expect(data?.abbreviation).toBe('EST');
      expect(data?.offset).toBe('-05:00');
    });
    it('should handle time calculations', async () => {
      // Arrange
      const timeApiData = {
        status: 'OK',
        message: '',
        countryCode: 'GB',
        zoneName: 'Europe/London',
        abbreviation: 'GMT',
        gmtOffset: 0,
        dst: '0',
        timestamp: 1705507530,
        formatted: '2024-01-17 18:45:30',
      };
      EndpointTestUtils.clearMocks();
      setupSuccessMock('/api/timezonedb/v2.1/get-time-zone', timeApiData);
      const { result } = renderHook(() => useTimeApi(), { wrapper });
      // Act
      const fetchResult = await result.current.getTime(mockTileId, londonParams);
      const data = fetchResult.data;
      // Assert
      expect(data).toBeDefined();
      expect(data?.currentTime).toBe('18:45:30');
      expect(data?.timezone).toBe('Europe/London');
      expect(data?.abbreviation).toBe('GMT');
      expect(data?.offset).toBe('+00:00');
    });
    it('should handle timezone offset data', async () => {
      // Arrange
      const timezoneApiData = {
        status: 'OK',
        message: '',
        countryCode: 'US',
        zoneName: 'America/Chicago',
        abbreviation: 'CST',
        gmtOffset: -18000,
        dst: '0',
        timestamp: 1705319700,
        formatted: '2024-01-15 09:15:00',
      };
      EndpointTestUtils.clearMocks();
      setupSuccessMock('/api/timezonedb/v2.1/get-time-zone', timezoneApiData);
      const { result } = renderHook(() => useTimeApi(), { wrapper });
      // Act
      const fetchResult = await result.current.getTime(mockTileId, chicagoParams);
      const data = fetchResult.data;
      // Assert
      expect(data).toBeDefined();
      expect(data?.offset).toBe('-05:00');
      expect(data?.timezone).toBe('America/Chicago');
      expect(data?.abbreviation).toBe('CST');
    });
  });
});
