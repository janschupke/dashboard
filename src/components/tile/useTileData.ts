import { useMemo, useEffect } from 'react';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { DateTime } from 'luxon';

import { REFRESH_INTERVALS } from '../../contexts/constants';
import { useTileRefreshService } from '../../hooks/useTileRefreshService';
import { storageManager } from '../../services/storageManager';
import { calculateTileStatus } from '../../utils/statusCalculator';
import { msToSeconds } from '../../utils/timeUtils';

import type { TileConfig, TileDataType } from '../../services/storageManager';

export const TileStatus = {
  Loading: 'loading',
  Success: 'success',
  Error: 'error',
  Stale: 'stale',
} as const;
export type TileStatus = (typeof TileStatus)[keyof typeof TileStatus];

export interface TileRefreshConfig {
  /** Refresh interval in milliseconds. If not provided, uses default from constants */
  refreshInterval?: number;
  /** Whether to enable automatic refresh. Defaults to true */
  enableAutoRefresh?: boolean;
  /** Whether to refresh on window focus. Defaults to true */
  refreshOnFocus?: boolean;
}

export function useTileData<T extends TileDataType, TPathParams, TQueryParams>(
  apiFn: (
    tileId: string,
    pathParams: TPathParams,
    queryParams: TQueryParams,
  ) => Promise<TileConfig<T>>,
  tileId: string,
  pathParams: TPathParams,
  queryParams: TQueryParams,
  refreshConfig?: TileRefreshConfig,
): {
  data: T | null;
  status: TileStatus;
  lastUpdated: Date | null;
  manualRefresh: () => void;
  isLoading: boolean;
} {
  // Get refresh configuration with defaults
  const {
    refreshInterval = REFRESH_INTERVALS.TILE_DATA,
    enableAutoRefresh = true,
    refreshOnFocus = true,
  } = refreshConfig ?? {};

  // Create a stable query key based on tile ID, path params, and query params
  const queryKey = useMemo(
    () => ['tile-data', tileId, pathParams, queryParams],
    [tileId, pathParams, queryParams],
  );

  // Create query options
  const queryOptions: UseQueryOptions<TileConfig<T>, Error> = useMemo(
    () => ({
      queryKey,
      queryFn: async () => {
        // Fetch new data - dataFetcher handles error logging and caching internally
        const tileConfig = await apiFn(tileId, pathParams, queryParams);
        // Store in localStorage for persistence (dataFetcher also stores, but this ensures sync)
        storageManager.setTileState<T>(tileId, tileConfig);
        return tileConfig;
      },
      // Initial data from localStorage (for SSR/hydration and initial load)
      // Only use initialData if it's fresh and valid, otherwise let React Query show loading state
      initialData: () => {
        const cachedData = storageManager.getTileState<T>(tileId);
        if (!cachedData) return undefined;
        // Only use cached data if it's fresh and has valid data
        const now = DateTime.now().toMillis();
        const timeSinceLastFetch = cachedData.lastDataRequest
          ? msToSeconds(now - cachedData.lastDataRequest)
          : Infinity;
        const isFresh = timeSinceLastFetch < msToSeconds(refreshInterval);
        const hasValidData = cachedData.data !== null && cachedData.data !== undefined;
        // Only use as initialData if fresh and valid, otherwise let it fetch
        if (isFresh && hasValidData && cachedData.lastDataRequestSuccessful) {
          return cachedData;
        }
        return undefined;
      },
      // Initial data updated at timestamp
      initialDataUpdatedAt: () => {
        const cachedData = storageManager.getTileState<T>(tileId);
        if (!cachedData) return 0;
        const now = DateTime.now().toMillis();
        const timeSinceLastFetch = cachedData.lastDataRequest
          ? msToSeconds(now - cachedData.lastDataRequest)
          : Infinity;
        const isFresh = timeSinceLastFetch < msToSeconds(refreshInterval);
        const hasValidData = cachedData.data !== null && cachedData.data !== undefined;
        if (isFresh && hasValidData && cachedData.lastDataRequestSuccessful) {
          return cachedData.lastDataRequest || 0;
        }
        return 0;
      },
      // Stale time: data is considered fresh for the refresh interval
      staleTime: enableAutoRefresh ? refreshInterval : Infinity,
      // Refetch interval: automatically refetch at this interval
      refetchInterval: enableAutoRefresh && refreshInterval > 0 ? refreshInterval : false,
      // Refetch on window focus
      refetchOnWindowFocus: refreshOnFocus && enableAutoRefresh,
      // Refetch on mount
      refetchOnMount: true,
      // Retry configuration
      retry: 1,
      retryDelay: 1000,
      // Keep previous data on error (v5 API)
      placeholderData: (previousData) => previousData,
      // Network mode
      networkMode: 'online',
    }),
    [
      queryKey,
      tileId,
      pathParams,
      queryParams,
      apiFn,
      refreshInterval,
      enableAutoRefresh,
      refreshOnFocus,
    ],
  );

  // Use React Query
  const {
    data: result,
    isLoading,
    isFetching,
    isPending,
    error,
    refetch,
  } = useQuery<TileConfig<T>, Error>(queryOptions);

  // Determine if we should show loading state
  // Show loading when:
  // 1. Query is pending (initial load, no data yet) - isPending
  // 2. Query is loading and no result - isLoading
  // 3. Query is fetching (including manual refresh) - isFetching
  // Always show loading when fetching to provide visual feedback, especially for manual refresh
  const showLoading = isPending || isLoading || isFetching;

  // Calculate status based on query state and result using extracted logic
  const statusResult = useMemo(() => {
    return calculateTileStatus<T>({
      showLoading,
      error,
      result,
      tileId,
      getCachedData: (id) => storageManager.getTileState<T>(id),
    });
  }, [showLoading, result, error, tileId]);

  const { status, data, lastUpdated: lastUpdatedDateTime } = statusResult;

  // Convert DateTime to Date for backward compatibility (can be removed later)
  const lastUpdated = lastUpdatedDateTime ? lastUpdatedDateTime.toJSDate() : null;

  // Register with refresh service for global refresh functionality
  const refreshService = useTileRefreshService();
  const manualRefresh = useMemo(
    () => () => {
      void refetch();
    },
    [refetch],
  );

  useEffect(() => {
    const unregister = refreshService.registerRefreshCallback(() => {
      void refetch();
    });

    return unregister;
  }, [refreshService, refetch]);

  return {
    data,
    status,
    lastUpdated,
    manualRefresh,
    isLoading: showLoading,
  };
}
