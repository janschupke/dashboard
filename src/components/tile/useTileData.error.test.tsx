import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { TileRefreshProvider } from '../../contexts/TileRefreshContext';
import { storageManager } from '../../services/storageManager';

import { useTileData, TileStatus } from './useTileData';

// Create a fresh QueryClient for each test with no retries/timers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchInterval: false,
      },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TileRefreshProvider>{children}</TileRefreshProvider>
    </QueryClientProvider>
  );
};

// Mock the storage manager
vi.mock('../../services/storageManager', () => ({
  storageManager: {
    getTileState: vi.fn(),
    setTileState: vi.fn(),
  },
}));

// Mock the constants
vi.mock('../../contexts/constants', () => ({
  REFRESH_INTERVALS: {
    TILE_DATA: 60000, // 1 minute
  },
  TIME_CONSTANTS: {
    MILLISECONDS_PER_SECOND: 1000,
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    DAYS_PER_WEEK: 7,
    DAYS_PER_MONTH: 30,
    DAYS_PER_YEAR: 365,
  },
}));

describe('useTileData - Error Tile Timestamp Updates', () => {
  const tileId = 'error-tile';
  const pathParams = {};
  const queryParams = { test: 'param' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageManager.getTileState).mockReturnValue(null);
  });

  it('updates lastDataRequest timestamp on repeated error requests', async () => {
    const mockApiFn = vi.fn(async () => {
      const now = DateTime.now().toMillis();
      // Simulate dataFetcher behavior: always returns TileConfig, never throws
      return {
        data: null,
        lastDataRequest: now,
        lastDataRequestSuccessful: false,
        lastSuccessfulDataRequest: null,
      };
    });

    const { result } = renderHook(
      () =>
        useTileData(mockApiFn, tileId, pathParams, queryParams, {
          refreshInterval: 60000,
          enableAutoRefresh: false,
        }),
      { wrapper: createWrapper() },
    );

    // Wait for first error request
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.status).toBe(TileStatus.Error);
    expect(result.current.data).toBeNull();
    const firstTimestamp = result.current.lastUpdated;
    expect(firstTimestamp).toBeTruthy();

    // Trigger a refetch by calling manualRefresh
    result.current.manualRefresh();

    // Wait for second error request
    await waitFor(() => {
      expect(mockApiFn).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have updated timestamp
    const secondTimestamp = result.current.lastUpdated;
    expect(secondTimestamp).toBeTruthy();
    if (!firstTimestamp || !secondTimestamp) throw new Error('Timestamps not found');
    expect(secondTimestamp.getTime()).toBeGreaterThan(firstTimestamp.getTime());
    expect(result.current.status).toBe(TileStatus.Error);
  });

  it('shows correct lastDataRequest timestamp for error tile with no cached data', async () => {
    const beforeTime = Date.now();
    const mockApiFn = vi.fn(async () => {
      const now = DateTime.now().toMillis();
      return {
        data: null,
        lastDataRequest: now,
        lastDataRequestSuccessful: false,
        lastSuccessfulDataRequest: null,
      };
    });

    const { result } = renderHook(
      () =>
        useTileData(mockApiFn, tileId, pathParams, queryParams, {
          refreshInterval: 60000,
          enableAutoRefresh: false,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.status).toBe(TileStatus.Error);
    expect(result.current.data).toBeNull();
    expect(result.current.lastUpdated).toBeTruthy();

    // Timestamp should be recent (within last second)
    const timestamp = result.current.lastUpdated?.getTime();
    if (!timestamp) throw new Error('Timestamp not found');
    expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('updates timestamp on manual refresh for error tile', async () => {
    const mockApiFn = vi.fn(async () => {
      const now = DateTime.now().toMillis();
      return {
        data: null,
        lastDataRequest: now,
        lastDataRequestSuccessful: false,
        lastSuccessfulDataRequest: null,
      };
    });

    const { result } = renderHook(
      () =>
        useTileData(mockApiFn, tileId, pathParams, queryParams, {
          refreshInterval: 60000,
          enableAutoRefresh: false,
        }),
      { wrapper: createWrapper() },
    );

    // Wait for initial error
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialTimestamp = result.current.lastUpdated;
    expect(initialTimestamp).toBeTruthy();

    // Wait a bit to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Manual refresh
    result.current.manualRefresh();

    // Wait for refresh to complete
    await waitFor(() => {
      expect(mockApiFn).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have new timestamp
    const newTimestamp = result.current.lastUpdated;
    if (!newTimestamp || !initialTimestamp) throw new Error('Timestamps not found');
    expect(newTimestamp.getTime()).toBeGreaterThan(initialTimestamp.getTime());
  });

  it('preserves lastSuccessfulDataRequest when error occurs with cached data', async () => {
    const now = DateTime.now().toMillis();
    const cachedData = {
      data: { test: 'cached' },
      lastDataRequest: now - 60000, // 1 minute ago
      lastDataRequestSuccessful: true,
      lastSuccessfulDataRequest: now - 60000,
    };

    vi.mocked(storageManager.getTileState).mockReturnValue(cachedData);

    const mockApiFn = vi.fn(async () => {
      const currentTime = DateTime.now().toMillis();
      // Simulate error with cached data
      return {
        ...cachedData.data,
        data: cachedData.data,
        lastDataRequest: currentTime, // New request timestamp
        lastDataRequestSuccessful: false,
        lastSuccessfulDataRequest: cachedData.lastSuccessfulDataRequest, // Preserved
      };
    });

    const { result } = renderHook(
      () =>
        useTileData(mockApiFn, tileId, pathParams, queryParams, {
          refreshInterval: 60000,
          enableAutoRefresh: false,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should be stale (has data but request failed)
    expect(result.current.status).toBe(TileStatus.Stale);
    expect(result.current.data).toEqual({ test: 'cached' });

    // Should have updated lastDataRequest but preserved lastSuccessfulDataRequest
    expect(result.current.lastUpdated).toBeTruthy();
    expect(result.current.lastSuccessfulDataUpdate).toBeTruthy();
  });
});
