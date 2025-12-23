import { useMemo } from 'react';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { REFRESH_INTERVALS } from '../../contexts/constants';
import { storageManager } from '../../services/storageManager';

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
  } = refreshConfig || {};

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
        const now = Date.now();
        const timeSinceLastFetch = cachedData.lastDataRequest ? now - cachedData.lastDataRequest : Infinity;
        const isFresh = timeSinceLastFetch < refreshInterval;
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
        const now = Date.now();
        const timeSinceLastFetch = cachedData.lastDataRequest ? now - cachedData.lastDataRequest : Infinity;
        const isFresh = timeSinceLastFetch < refreshInterval;
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
    [queryKey, tileId, pathParams, queryParams, apiFn, refreshInterval, enableAutoRefresh, refreshOnFocus],
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
  // 3. Query is fetching and no valid data available - isFetching && (!result || !result?.data)
  // Note: We prioritize showing loading when there's no valid data to display
  const hasValidData = result?.data !== null && result?.data !== undefined;
  // Show loading on initial load (isPending) or when loading without data (isLoading)
  // Also show when fetching if we don't have valid data to show
  // If we're fetching and have no result yet, show loading
  const showLoading = isPending || isLoading || (isFetching && (!result || !hasValidData));

  // Calculate status based on query state and result
  const { status, data, lastUpdated } = useMemo(() => {
    // Show loading state when fetching and no data available
    if (showLoading) {
      return {
        status: TileStatus.Loading,
        data: null as T | null,
        lastUpdated: null as Date | null,
      };
    }

    if (error || !result) {
      // Try to get cached data on error
      const cachedData = storageManager.getTileState<T>(tileId);
      if (cachedData && cachedData.data) {
        return {
          status: TileStatus.Stale,
          data: cachedData.data,
          lastUpdated: cachedData.lastDataRequest ? new Date(cachedData.lastDataRequest) : null,
        };
      }
      return {
        status: TileStatus.Error,
        data: null as T | null,
        lastUpdated: null as Date | null,
      };
    }

    const data = result.data;
    const lastUpdated = result.lastDataRequest ? new Date(result.lastDataRequest) : null;

    if (result.lastDataRequestSuccessful && data) {
      return {
        status: TileStatus.Success,
        data,
        lastUpdated,
      };
    } else if (!result.lastDataRequestSuccessful && data) {
      return {
        status: TileStatus.Stale,
        data,
        lastUpdated,
      };
    } else {
      return {
        status: TileStatus.Error,
        data: null as T | null,
        lastUpdated: null as Date | null,
      };
    }
  }, [showLoading, result, error, tileId]);

  return {
    data,
    status,
    lastUpdated,
    manualRefresh: () => {
      refetch();
    },
    isLoading: showLoading,
  };
}
