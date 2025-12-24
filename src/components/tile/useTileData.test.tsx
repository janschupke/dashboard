import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { TileRefreshProvider } from '../../contexts/TileRefreshContext';
import { storageManager } from '../../services/storageManager';

import { useTileData } from './useTileData';

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

describe('useTileData', () => {
  const mockApiFn = vi.fn();
  const tileId = 'test-tile';
  const pathParams = {};
  const queryParams = { test: 'param' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use cached data when it is fresh enough', async () => {
    const now = DateTime.now().toMillis();
    const freshData = {
      data: { test: 'data' },
      lastDataRequest: now - 30000, // 30 seconds ago (fresh)
      lastDataRequestSuccessful: true,
    };

    // Mock storage manager to return fresh cached data
    vi.mocked(storageManager.getTileState).mockReturnValue(freshData);

    const { result } = renderHook(
      () =>
        useTileData(mockApiFn, tileId, pathParams, queryParams, {
          refreshInterval: 60000,
          enableAutoRefresh: false, // Disable auto refresh to avoid interval issues
        }),
      { wrapper: createWrapper() },
    );

    // Wait for the hook to settle
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not call the API function since data is fresh
    expect(mockApiFn).not.toHaveBeenCalled();

    // Should return the cached data
    expect(result.current.data).toEqual({ test: 'data' });
    expect(result.current.status).toBe('success');
  });

  it('should make API call when cached data is stale', async () => {
    const now = Date.now();
    const staleData = {
      data: { test: 'old-data' },
      lastDataRequest: now - 120000, // 2 minutes ago (stale)
      lastDataRequestSuccessful: true,
    };

    const newData = {
      data: { test: 'new-data' },
      lastDataRequest: now,
      lastDataRequestSuccessful: true,
    };

    // Mock storage manager to return stale cached data
    vi.mocked(storageManager.getTileState).mockReturnValue(staleData);

    // Mock API function to return new data
    mockApiFn.mockResolvedValue(newData);

    const { result } = renderHook(
      () =>
        useTileData(mockApiFn, tileId, pathParams, queryParams, {
          refreshInterval: 60000,
          enableAutoRefresh: false, // Disable auto refresh to avoid interval issues
        }),
      { wrapper: createWrapper() },
    );

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should call the API function since data is stale
    expect(mockApiFn).toHaveBeenCalledWith(tileId, pathParams, queryParams);

    // Should return the new data
    expect(result.current.data).toEqual({ test: 'new-data' });
    expect(result.current.status).toBe('success');
  });

  it('should make API call when no cached data exists', async () => {
    const now = Date.now();
    const newData = {
      data: { test: 'new-data' },
      lastDataRequest: now,
      lastDataRequestSuccessful: true,
    };

    // Mock storage manager to return null (no cached data)
    vi.mocked(storageManager.getTileState).mockReturnValue(null);

    // Mock API function to return new data
    mockApiFn.mockResolvedValue(newData);

    const { result } = renderHook(
      () =>
        useTileData(mockApiFn, tileId, pathParams, queryParams, {
          refreshInterval: 60000,
          enableAutoRefresh: false, // Disable auto refresh to avoid interval issues
        }),
      { wrapper: createWrapper() },
    );

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should call the API function since no cached data exists
    expect(mockApiFn).toHaveBeenCalledWith(tileId, pathParams, queryParams);

    // Should return the new data
    expect(result.current.data).toEqual({ test: 'new-data' });
    expect(result.current.status).toBe('success');
  });

  it('should force refresh when manualRefresh is called', async () => {
    const now = Date.now();
    const freshData = {
      data: { test: 'data' },
      lastDataRequest: now - 30000, // 30 seconds ago (fresh)
      lastDataRequestSuccessful: true,
    };

    const newData = {
      data: { test: 'new-data' },
      lastDataRequest: now,
      lastDataRequestSuccessful: true,
    };

    // Mock storage manager to return fresh cached data
    vi.mocked(storageManager.getTileState).mockReturnValue(freshData);

    // Mock API function to return new data
    mockApiFn.mockResolvedValue(newData);

    const { result } = renderHook(
      () =>
        useTileData(mockApiFn, tileId, pathParams, queryParams, {
          refreshInterval: 60000,
          enableAutoRefresh: false, // Disable auto refresh to avoid interval issues
        }),
      { wrapper: createWrapper() },
    );

    // Wait for the hook to settle with fresh cached data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not call API initially since data is fresh
    expect(mockApiFn).not.toHaveBeenCalled();

    // Call manual refresh
    result.current.manualRefresh();

    // Wait for the refetch to complete
    await waitFor(() => {
      expect(mockApiFn).toHaveBeenCalledWith(tileId, pathParams, queryParams);
    });

    // Should return the new data
    await waitFor(() => {
      expect(result.current.data).toEqual({ test: 'new-data' });
    });
  });
});
