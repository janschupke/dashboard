import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTileData } from './useTileData';
import { storageManager } from '../../services/storageManager';

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
}));

describe('useTileData', () => {
  const mockApiFn = vi.fn();
  const tileId = 'test-tile';
  const params = { test: 'param' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should use cached data when it is fresh enough', async () => {
    const now = Date.now();
    const freshData = {
      data: { test: 'data' },
      lastDataRequest: now - 30000, // 30 seconds ago (fresh)
      lastDataRequestSuccessful: true,
    };

    // Mock storage manager to return fresh cached data
    vi.mocked(storageManager.getTileState).mockReturnValue(freshData);

    const { result } = renderHook(() =>
      useTileData(mockApiFn, tileId, params, {
        refreshInterval: 60000,
        enableAutoRefresh: false, // Disable auto refresh to avoid interval issues
      }),
    );

    // Wait for the hook to initialize
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should not call the API function since data is fresh
    expect(mockApiFn).not.toHaveBeenCalled();

    // Should return the cached data
    expect(result.current.data).toEqual({ test: 'data' });
    expect(result.current.status).toBe('success');
    expect(result.current.isLoading).toBe(false);
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

    const { result } = renderHook(() =>
      useTileData(mockApiFn, tileId, params, {
        refreshInterval: 60000,
        enableAutoRefresh: false, // Disable auto refresh to avoid interval issues
      }),
    );

    // Wait for the hook to initialize
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should call the API function since data is stale
    expect(mockApiFn).toHaveBeenCalledWith(tileId, params);

    // Should return the new data
    expect(result.current.data).toEqual({ test: 'new-data' });
    expect(result.current.status).toBe('success');
    expect(result.current.isLoading).toBe(false);
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

    const { result } = renderHook(() =>
      useTileData(mockApiFn, tileId, params, {
        refreshInterval: 60000,
        enableAutoRefresh: false, // Disable auto refresh to avoid interval issues
      }),
    );

    // Wait for the hook to initialize
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should call the API function since no cached data exists
    expect(mockApiFn).toHaveBeenCalledWith(tileId, params);

    // Should return the new data
    expect(result.current.data).toEqual({ test: 'new-data' });
    expect(result.current.status).toBe('success');
    expect(result.current.isLoading).toBe(false);
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

    const { result } = renderHook(() =>
      useTileData(mockApiFn, tileId, params, {
        refreshInterval: 60000,
        enableAutoRefresh: false, // Disable auto refresh to avoid interval issues
      }),
    );

    // Wait for the hook to initialize
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should not call API initially since data is fresh
    expect(mockApiFn).not.toHaveBeenCalled();

    // Call manual refresh
    await act(async () => {
      result.current.manualRefresh();
      await vi.runAllTimersAsync();
    });

    // Should call the API function when manual refresh is triggered
    expect(mockApiFn).toHaveBeenCalledWith(tileId, params);

    // Should return the new data
    expect(result.current.data).toEqual({ test: 'new-data' });
  });
});
