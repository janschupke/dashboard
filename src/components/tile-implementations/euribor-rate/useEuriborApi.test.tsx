import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

import { storageManager } from '../../../services/storageManager';
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import { server } from '../../../test/mocks/server';
import {
  setupEuriborRateSuccessMock,
  setupFailureMock,
  API_ENDPOINTS,
} from '../../../test/utils/mswTestUtils';
import { TileType } from '../../../types/tile';

import { ecbEuriborDataMapper } from './dataMapper';
import { useEuriborApi } from './useEuriborApi';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ mapperRegistry }) => {
      mapperRegistry.register(TileType.EURIBOR_RATE, ecbEuriborDataMapper);
    }}
  >
    {children}
  </MockDataServicesProvider>
);

describe('useEuriborApi', () => {
  const mockTileId = 'test-euribor-tile';
  const mockParams = {};

  beforeAll(() => {
    // registerEcbEuriborDataMapper(); // This line is removed as per the new_code
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and maps ECB Euribor data successfully', async () => {
    setupEuriborRateSuccessMock();
    const { result } = renderHook(() => useEuriborApi(), { wrapper });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fetchResult: any = null;
    await act(async () => {
      fetchResult = await result.current.getEuriborRate(mockTileId, {}, mockParams);
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
        expect(typeof data.currentRate).toBe('number');
        expect(Array.isArray(data.historicalData)).toBe(true);
        expect(data.lastUpdate).toBeInstanceOf(Date);
      }
    }
  });

  it('returns empty data and error if API returns not ok', async () => {
    server.resetHandlers();
    storageManager.clearTileState();
    setupFailureMock(API_ENDPOINTS.ECB_EURIBOR_12M, 'api');
    const { result } = renderHook(() => useEuriborApi(), { wrapper });
    const fetchResult = await result.current.getEuriborRate('failure-test-api', {}, mockParams);
    expect(fetchResult.lastDataRequestSuccessful).toBe(false);
    expect(fetchResult.data).toBeNull();
  });

  it('returns empty data and error if fetch fails', async () => {
    server.resetHandlers();
    storageManager.clearTileState();
    setupFailureMock(API_ENDPOINTS.ECB_EURIBOR_12M, 'network');
    const { result } = renderHook(() => useEuriborApi(), { wrapper });
    const fetchResult = await result.current.getEuriborRate('failure-test-network', {}, mockParams);
    expect(fetchResult.lastDataRequestSuccessful).toBe(false);
    expect(fetchResult.data).toBeNull();
  });
});
