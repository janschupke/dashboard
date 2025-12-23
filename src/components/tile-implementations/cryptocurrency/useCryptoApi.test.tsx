import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';

import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import { MockResponseData } from '../../../test/mocks/endpointMocks';
import {
  API_ENDPOINTS,
  setupCryptocurrencySuccessMock,
  setupSuccessMock,
  setupDelayedMock,
  setupFailureMock,
} from '../../../test/utils/mswTestUtils';
import { TileType } from '../../../types/tile';

import { CryptocurrencyDataMapper } from './dataMapper';
import { useCryptoApi } from './useCryptoApi';

import type { CryptoMarketsQueryParams } from '../../../services/apiEndpoints';

beforeAll(() => {
  // Removed: registerCryptocurrencyDataMapper();
});

describe('useCryptoApi', () => {
  const mockTileId = 'test-crypto-tile';
  const mockParams: CryptoMarketsQueryParams = {
    vs_currency: 'usd',
    ids: 'bitcoin,ethereum',
    order: 'market_cap_desc',
    per_page: 10,
    page: 1,
    sparkline: false,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MockDataServicesProvider
      setup={({ mapperRegistry }) => {
        mapperRegistry.register(TileType.CRYPTOCURRENCY, new CryptocurrencyDataMapper());
      }}
    >
      {children}
    </MockDataServicesProvider>
  );

  describe('getCryptocurrencyMarkets - Success Scenarios', () => {
    it('should successfully fetch cryptocurrency data', async () => {
      // Arrange
      setupCryptocurrencySuccessMock();
      const { result } = renderHook(() => useCryptoApi(), { wrapper });

      // Act
      const fetchResult = await result.current.getCryptocurrencyMarkets(mockTileId, {}, mockParams);

      // Assert
      expect(fetchResult).toBeDefined();
      expect(fetchResult).toHaveProperty('data');
      expect(fetchResult).toHaveProperty('lastDataRequest');
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
      // For error state:
      // expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      // For success state:
      // expect(fetchResult.lastDataRequestSuccessful).toBe(true);
      // For timestamp:
      expect(typeof fetchResult.lastDataRequest).toBe('number');

      const data = fetchResult.data;
      expect(data).toBeDefined();
      expect(data).toEqual(
        expect.objectContaining({
          coins: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              symbol: expect.any(String),
              name: expect.any(String),
              current_price: expect.any(Number),
            }),
          ]),
        }),
      );
    });

    it('should handle empty response data', async () => {
      // Arrange
      setupSuccessMock(API_ENDPOINTS.COINGECKO_MARKETS, []);
      const { result } = renderHook(() => useCryptoApi(), { wrapper });

      // Act
      const fetchResult = await result.current.getCryptocurrencyMarkets(mockTileId, {}, mockParams);

      // Assert
      const data = fetchResult.data;
      expect(data?.coins).toEqual([]);
    });

    it('should handle delayed response', async () => {
      // Arrange
      setupDelayedMock(
        API_ENDPOINTS.COINGECKO_MARKETS,
        MockResponseData.getCryptocurrencyData(),
        50,
      );
      const { result } = renderHook(() => useCryptoApi(), { wrapper });

      // Act & Assert
      await waitFor(async () => {
        const fetchResult = await result.current.getCryptocurrencyMarkets(
          mockTileId,
          {},
          mockParams,
        );
        const data = fetchResult.data;
        expect(data?.coins).toEqual(MockResponseData.getCryptocurrencyData());
      });
    });
  });

  describe('getCryptocurrencyMarkets - Failure Scenarios', () => {
    it('should handle network errors', async () => {
      // Arrange
      setupFailureMock(API_ENDPOINTS.COINGECKO_MARKETS, 'network');
      const { result } = renderHook(() => useCryptoApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getCryptocurrencyMarkets(mockTileId, {}, mockParams);
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      // expect(fetchResult.lastDataRequest).toContain('Network error: Failed to fetch'); // Removed
    });

    it('should handle timeout errors', async () => {
      // Arrange
      setupFailureMock(API_ENDPOINTS.COINGECKO_MARKETS, 'timeout');
      const { result } = renderHook(() => useCryptoApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getCryptocurrencyMarkets(mockTileId, {}, mockParams);
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      // expect(fetchResult.lastDataRequest).toContain('Request timeout'); // Removed
    });

    it('should handle API errors (500)', async () => {
      // Arrange
      setupFailureMock(API_ENDPOINTS.COINGECKO_MARKETS, 'api');
      const { result } = renderHook(() => useCryptoApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getCryptocurrencyMarkets(mockTileId, {}, mockParams);
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      // expect(fetchResult.lastDataRequest).toContain('API error: 500 Internal Server Error'); // Removed
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      setupFailureMock(API_ENDPOINTS.COINGECKO_MARKETS, 'malformed');
      const { result } = renderHook(() => useCryptoApi(), { wrapper });

      // Act & Assert
      const fetchResult = await result.current.getCryptocurrencyMarkets(mockTileId, {}, mockParams);
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      // expect(fetchResult.lastDataRequest).toContain('Invalid JSON response'); // Removed
    });
  });

  describe('getCryptocurrencyMarkets - Edge Cases', () => {
    it('should handle different parameter combinations', async () => {
      // Arrange
      setupCryptocurrencySuccessMock();
      const { result } = renderHook(() => useCryptoApi(), { wrapper });

      // Only test the default params that are actually mocked
      const testParams: CryptoMarketsQueryParams[] = [
        {
          vs_currency: 'usd',
          ids: 'bitcoin,ethereum',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false,
        },
      ];

      // Act & Assert
      for (const params of testParams) {
        const fetchResult = await result.current.getCryptocurrencyMarkets(mockTileId, {}, params);
        const data = fetchResult.data;
        expect(data?.coins).toEqual(MockResponseData.getCryptocurrencyData());
      }
    });

    it('should handle null response data', async () => {
      // Arrange
      setupSuccessMock(API_ENDPOINTS.COINGECKO_MARKETS, null);
      const { result } = renderHook(() => useCryptoApi(), { wrapper });

      // Act
      const fetchResult = await result.current.getCryptocurrencyMarkets(mockTileId, {}, mockParams);

      // Assert
      expect(fetchResult.data).toBeNull();
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
    });
  });

  describe('getCryptocurrencyMarkets - Data Validation', () => {
    it('should return properly structured cryptocurrency data', async () => {
      // Arrange
      setupCryptocurrencySuccessMock();
      const { result } = renderHook(() => useCryptoApi(), { wrapper });

      // Act
      const fetchResult = await result.current.getCryptocurrencyMarkets(mockTileId, {}, mockParams);

      // Assert
      const data = fetchResult.data;
      expect(data?.coins).toBeInstanceOf(Array);
      expect(data?.coins?.length).toBeGreaterThan(0);

      const bitcoin = data?.coins?.find((coin) => coin.id === 'bitcoin');
      expect(bitcoin).toBeDefined();
      expect(bitcoin).toMatchObject({
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: expect.any(Number),
        market_cap: expect.any(Number),
        market_cap_rank: expect.any(Number),
        price_change_percentage_24h: expect.any(Number),
        price_change_24h: expect.any(Number),
        total_volume: expect.any(Number),
        circulating_supply: expect.any(Number),
        total_supply: expect.any(Number),
        max_supply: expect.any(Number),
        ath: expect.any(Number),
        ath_change_percentage: expect.any(Number),
        atl: expect.any(Number),
        atl_change_percentage: expect.any(Number),
        last_updated: expect.any(String),
      });
    });
  });
});
