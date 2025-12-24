import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

import { storageManager } from '../../../services/storageManager';
import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import { setupEarthquakeSuccessMock, setupFailureMock } from '../../../test/utils/mswTestUtils';
import { TileType } from '../../../types/tile';

import { earthquakeDataMapper } from './dataMapper';
import { useEarthquakeApi } from './useEarthquakeApi';

import type { UsgsEarthquakeQueryParams } from '../../../services/apiEndpoints';

beforeAll(() => {
  // registerEarthquakeDataMapper(); // This line is removed as per the new_code
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ mapperRegistry }) => {
      mapperRegistry.register(TileType.EARTHQUAKE, earthquakeDataMapper);
    }}
  >
    {children}
  </MockDataServicesProvider>
);

describe('useEarthquakeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageManager.clearTileState(); // Clear cache between tests
  });

  const mockParams: UsgsEarthquakeQueryParams = {
    format: 'geojson',
    starttime: '2024-01-01',
    endtime: '2024-01-08',
  };

  it('fetches and maps USGS earthquake data successfully', async () => {
    setupEarthquakeSuccessMock();
    const { result } = renderHook(() => useEarthquakeApi(), { wrapper });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fetchResult: any = null;
    await act(async () => {
      fetchResult = await result.current.getEarthquakes('test-tile', {}, mockParams);
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
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
        expect(data.items.length).toBe(1);
        expect(data.items[0].id).toBe('abcd1234');
        expect(data.items[0].place).toBe('100km S of Randomville');
        expect(data.items[0].magnitude).toBe(5.2);
        expect(data.items[0].coordinates).toEqual([140.123, 35.678, 10]);
      }
    }
  });

  it('returns empty data and error if API returns not ok', async () => {
    setupFailureMock('/api/usgs/fdsnws/event/1/query', 'api');
    const { result } = renderHook(() => useEarthquakeApi(), { wrapper });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fetchResult: any = null;
    await act(async () => {
      fetchResult = await result.current.getEarthquakes('test-tile', {}, mockParams);
    });
    expect(fetchResult).not.toBeNull();
    if (fetchResult) {
      expect(fetchResult).toHaveProperty('data');
      expect(fetchResult).toHaveProperty('lastDataRequest');
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      expect(fetchResult.data).toBeNull();
    }
  });

  it('returns empty data and error if fetch fails', async () => {
    setupFailureMock('/api/usgs/fdsnws/event/1/query', 'network');
    const { result } = renderHook(() => useEarthquakeApi(), { wrapper });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fetchResult: any = null;
    await act(async () => {
      fetchResult = await result.current.getEarthquakes('test-tile', {}, mockParams);
    });
    expect(fetchResult).not.toBeNull();
    if (fetchResult) {
      expect(fetchResult).toHaveProperty('data');
      expect(fetchResult).toHaveProperty('lastDataRequest');
      expect(fetchResult).toHaveProperty('lastDataRequestSuccessful');
      expect(fetchResult.lastDataRequestSuccessful).toBe(false);
      expect(fetchResult.data).toBeNull();
    }
  });
});
