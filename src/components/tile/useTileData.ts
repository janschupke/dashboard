import { useState, useEffect, useRef, useCallback } from 'react';
import type { TileConfig, TileDataType } from '../../services/storageManager';
import { storageManager } from '../../services/storageManager';
import { REFRESH_INTERVALS } from '../../contexts/constants';

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
  const [result, setResult] = useState<TileConfig<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const refreshIntervalRef = useRef<number>(REFRESH_INTERVALS.TILE_DATA);
  const apiFnRef = useRef(apiFn);
  const tileIdRef = useRef(tileId);
  const pathParamsRef = useRef(pathParams);
  const queryParamsRef = useRef(queryParams);

  // Update refs when props change
  useEffect(() => {
    apiFnRef.current = apiFn;
    tileIdRef.current = tileId;
    pathParamsRef.current = pathParams;
    queryParamsRef.current = queryParams;
  }, [apiFn, tileId, pathParams, queryParams]);

  // Get refresh configuration with defaults
  const {
    refreshInterval = REFRESH_INTERVALS.TILE_DATA,
    enableAutoRefresh = true,
    refreshOnFocus = true,
  } = refreshConfig || {};

  // Update the ref when refreshInterval changes
  useEffect(() => {
    refreshIntervalRef.current = refreshInterval;
  }, [refreshInterval]);

  // Function to check if cached data is fresh enough
  const isDataFresh = useCallback((cachedData: TileConfig<T> | null): boolean => {
    if (!cachedData || !cachedData.lastDataRequest) {
      return false;
    }
    const now = Date.now();
    const timeSinceLastFetch = now - cachedData.lastDataRequest;
    return timeSinceLastFetch < refreshIntervalRef.current;
  }, []);

  // Function to fetch data
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      let cancelled = false;
      setIsLoading(true);

      try {
        // Check if we have fresh cached data and we're not forcing a refresh
        if (!forceRefresh) {
          const cachedData = storageManager.getTileState<T>(tileIdRef.current);
          if (isDataFresh(cachedData)) {
            // Use cached data if it's fresh enough
            setResult(cachedData);
            setIsLoading(false);
            lastFetchTimeRef.current = cachedData?.lastDataRequest || Date.now();
            return;
          }
        }

        // Make API call if data is stale or we're forcing a refresh
        const tileConfig = await apiFnRef.current(
          tileIdRef.current,
          pathParamsRef.current,
          queryParamsRef.current,
        );
        if (!cancelled) {
          setResult(tileConfig);
          setIsLoading(false);
          lastFetchTimeRef.current = Date.now();
        }
      } catch {
        if (!cancelled) {
          setIsLoading(false);
        }
      }

      return () => {
        cancelled = true;
      };
    },
    [isDataFresh],
  );

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Automatic refresh logic
  useEffect(() => {
    if (!enableAutoRefresh || refreshInterval <= 0) {
      return;
    }

    const setupInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTimeRef.current;

        // Only refresh if enough time has passed since last fetch
        if (timeSinceLastFetch >= refreshIntervalRef.current) {
          fetchData();
        }
      }, refreshInterval);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause interval when tab is not visible
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Resume interval when tab becomes visible
        setupInterval();
      }
    };

    // Start the interval
    setupInterval();

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount or config change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableAutoRefresh, refreshInterval, fetchData]);

  // Refresh on window focus
  useEffect(() => {
    if (!refreshOnFocus || !enableAutoRefresh) {
      return;
    }

    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;

      // Refresh if the configured interval has passed since last fetch
      if (timeSinceLastFetch > refreshIntervalRef.current) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshOnFocus, enableAutoRefresh, fetchData]);

  // Calculate status
  let status: TileStatus = TileStatus.Loading;
  let lastUpdated: Date | null = null;
  let data: T | null = null;

  if (isLoading) {
    status = TileStatus.Loading;
  } else if (result) {
    data = result.data;
    lastUpdated = result.lastDataRequest ? new Date(result.lastDataRequest) : null;
    if (result.lastDataRequestSuccessful && data) {
      status = TileStatus.Success;
    } else if (!result.lastDataRequestSuccessful && data) {
      status = TileStatus.Stale;
    } else {
      status = TileStatus.Error;
    }
  }

  return { data, status, lastUpdated, manualRefresh: () => fetchData(true), isLoading };
}
