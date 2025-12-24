import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

import { ALPHA_VANTAGE_GDX_ENDPOINT } from '../../../services/apiEndpoints';
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import { setupSuccessMock, setupFailureMock } from '../../../test/utils/mswTestUtils';
import { TileType } from '../../../types/tile';

import { gdxEtfDataMapper } from './dataMapper';
import { useGdxEtfApi } from './useGdxEtfApi';

import type { AlphaVantageQueryParams } from '../../../services/apiEndpoints';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ mapperRegistry }) => {
      mapperRegistry.register(TileType.GDX_ETF, gdxEtfDataMapper);
    }}
  >
    {children}
  </MockDataServicesProvider>
);

beforeAll(() => {
  // registerGdxEtfDataMapper(); // This line is removed as per the new_code
});

describe('useGdxEtfApi', () => {
  const mockTileId = 'test-gdx-tile';
  const mockParams: AlphaVantageQueryParams = {
    function: 'GLOBAL_QUOTE',
    symbol: 'GDX',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessMock(ALPHA_VANTAGE_GDX_ENDPOINT.url, {
      'Global Quote': {
        '01. symbol': 'GDX',
        '02. open': '30.10',
        '03. high': '31.00',
        '04. low': '29.50',
        '05. price': '30.50',
        '06. volume': '1000000',
        '07. latest trading day': '2024-06-01',
        '08. previous close': '30.00',
        '09. change': '0.50',
        '10. change percent': '1.67%',
      },
    });
  });

  it('fetches and maps Alpha Vantage GDX ETF data successfully', async () => {
    const { result } = renderHook(() => useGdxEtfApi(), { wrapper });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fetchResult: any = null;
    await act(async () => {
      fetchResult = await result.current.getGdxEtf(mockTileId, {}, mockParams);
    });
    expect(fetchResult).not.toBeNull();
    if (fetchResult) {
      expect(fetchResult).toHaveProperty('data');
      expect(fetchResult).toHaveProperty('lastDataRequest');
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
      expect(typeof fetchResult.lastDataRequest).toBe('number');
      const data = fetchResult.data;
      expect(data).toBeDefined();
      if (data) {
        expect(data.symbol).toBe('GDX');
        expect(data.currentPrice).toBe(30.5);
        expect(data.tradingStatus).toBe('open');
      }
    }
  });

  it('returns empty data and error if API returns not ok', async () => {
    setupFailureMock(ALPHA_VANTAGE_GDX_ENDPOINT.url, 'api');
    const { result } = renderHook(() => useGdxEtfApi(), { wrapper });
    const fetchResult = await result.current.getGdxEtf(mockTileId, {}, mockParams);
    expect(fetchResult.lastDataRequestSuccessful).toBe(false);
    expect(fetchResult.data).toBeNull();
  });

  it('returns empty data and error if fetch fails', async () => {
    setupFailureMock(ALPHA_VANTAGE_GDX_ENDPOINT.url, 'network');
    const { result } = renderHook(() => useGdxEtfApi(), { wrapper });
    const fetchResult = await result.current.getGdxEtf(mockTileId, {}, mockParams);
    expect(fetchResult.lastDataRequestSuccessful).toBe(false);
    expect(fetchResult.data).toBeNull();
  });
});
