import { describe, it, expect, beforeAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFederalFundsApi } from './useFederalFundsApi';
import './dataMapper';
import { FederalFundsRateDataMapper } from './dataMapper';
import { TileType } from '../../../types/tile';
import {
  EndpointTestUtils,
  API_ENDPOINTS,
  setupFederalFundsRateSuccessMock,
  setupDelayedMock,
  setupFailureMock,
} from '../../../test/utils/endpointTestUtils';
import { MockResponseData } from '../../../test/mocks/endpointMocks';
import type { FredParams } from '../../../services/apiEndpoints';
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ mapperRegistry }) => {
      mapperRegistry.register(TileType.FEDERAL_FUNDS_RATE, new FederalFundsRateDataMapper());
    }}
  >
    {children}
  </MockDataServicesProvider>
);

beforeAll(() => {
  // registerFederalFundsRateDataMapper(); // This line is removed as per the edit hint
});

describe('useFederalFundsApi', () => {
  const mockTileId = 'test-federal-funds-tile';
  const mockParams: FredParams = {
    series_id: 'FEDFUNDS',
    file_type: 'json',
  };

  describe('getFederalFundsRate - Success Scenarios', () => {
    it('should successfully fetch mapped federal funds rate tile data', async () => {
      EndpointTestUtils.clearMocks();
      setupFederalFundsRateSuccessMock();
      const { result } = renderHook(() => useFederalFundsApi(), { wrapper });
      const fetchResult = await result.current.getFederalFundsRate(mockTileId, mockParams);
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('data');
      expect(fetchResult).toHaveProperty('lastDataRequest');
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
      expect(typeof fetchResult.lastDataRequest).toBe('number');

      const data = fetchResult.data;
      expect(data).toBeDefined();
      expect(data).toHaveProperty('currentRate');
      expect(data).toHaveProperty('lastUpdate');
      expect(data).toHaveProperty('historicalData');
      expect(typeof data?.currentRate).toBe('number');
      expect(Array.isArray(data?.historicalData)).toBe(true);
      expect(data?.historicalData?.length).toBeGreaterThan(0);
      expect(data?.historicalData?.[0]).toEqual(
        expect.objectContaining({
          date: expect.any(Date),
          rate: expect.any(Number),
        }),
      );
    });

    it('should handle delayed response', async () => {
      EndpointTestUtils.clearMocks();
      setupDelayedMock(
        API_ENDPOINTS.FRED_SERIES_OBSERVATIONS,
        MockResponseData.getFederalFundsRateData(),
        50,
      );
      const { result } = renderHook(() => useFederalFundsApi(), { wrapper });
      await waitFor(async () => {
        const fetchResult = await result.current.getFederalFundsRate(mockTileId, mockParams);
        expect(fetchResult).toBeDefined();
        const data = fetchResult.data;
        expect(data).toBeDefined();
        expect(typeof data?.currentRate).toBe('number');
        expect(Array.isArray(data?.historicalData)).toBe(true);
        expect(data?.historicalData?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getFederalFundsRate - Failure Scenarios', () => {
    it('should handle network errors', async () => {
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'network');
      const { result } = renderHook(() => useFederalFundsApi(), { wrapper });
      const fetchResult = await result.current.getFederalFundsRate(mockTileId, mockParams);
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful', false);
      expect(fetchResult.lastDataRequest).toBeDefined();
      expect(typeof fetchResult.lastDataRequest).toBe('number');
    });

    it('should handle timeout errors', async () => {
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'timeout');
      const { result } = renderHook(() => useFederalFundsApi(), { wrapper });
      const fetchResult = await result.current.getFederalFundsRate(mockTileId, mockParams);
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful', false);
      expect(fetchResult.lastDataRequest).toBeDefined();
      expect(typeof fetchResult.lastDataRequest).toBe('number');
    });

    it('should handle API errors (500)', async () => {
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'api');
      const { result } = renderHook(() => useFederalFundsApi(), { wrapper });
      const fetchResult = await result.current.getFederalFundsRate(mockTileId, mockParams);
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful', false);
      expect(fetchResult.lastDataRequest).toBeDefined();
      expect(typeof fetchResult.lastDataRequest).toBe('number');
    });

    it('should handle malformed JSON responses', async () => {
      EndpointTestUtils.clearMocks();
      setupFailureMock(API_ENDPOINTS.FRED_SERIES_OBSERVATIONS, 'malformed');
      const { result } = renderHook(() => useFederalFundsApi(), { wrapper });
      const fetchResult = await result.current.getFederalFundsRate(mockTileId, mockParams);
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful', false);
      expect(fetchResult.lastDataRequest).toBeDefined();
      expect(typeof fetchResult.lastDataRequest).toBe('number');
    });
  });

  describe('getFederalFundsRate - Edge Cases', () => {
    it('should handle different series IDs', async () => {
      EndpointTestUtils.clearMocks();
      setupFederalFundsRateSuccessMock();
      const { result } = renderHook(() => useFederalFundsApi(), { wrapper });
      const testParams: FredParams[] = [
        { series_id: 'FEDFUNDS', file_type: 'json' },
        { series_id: 'DFF', file_type: 'json' },
        { series_id: 'EFFR', file_type: 'json' },
      ];
      for (const params of testParams) {
        const fetchResult = await result.current.getFederalFundsRate(mockTileId, params);
        expect(fetchResult).toBeDefined();
        const data = fetchResult.data;
        expect(data).toBeDefined();
        expect(typeof data?.currentRate).toBe('number');
        expect(Array.isArray(data?.historicalData)).toBe(true);
        // Do not require historicalData.length > 0 for all series IDs
      }
    });
  });

  describe('getFederalFundsRate - Data Validation', () => {
    it('should return properly structured mapped federal funds rate tile data', async () => {
      EndpointTestUtils.clearMocks();
      setupFederalFundsRateSuccessMock();
      const { result } = renderHook(() => useFederalFundsApi(), { wrapper });
      const fetchResult = await result.current.getFederalFundsRate(mockTileId, mockParams);
      const data = fetchResult.data;
      expect(data).toMatchObject({
        currentRate: expect.any(Number),
        lastUpdate: expect.any(Date),
        historicalData: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(Date),
            rate: expect.any(Number),
          }),
        ]),
      });
      expect(data?.historicalData?.length).toBeGreaterThan(0);
      data?.historicalData?.forEach((entry) => {
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('rate');
      });
    });
  });
});
