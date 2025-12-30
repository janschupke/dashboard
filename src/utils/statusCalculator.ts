import { DateTime } from 'luxon';

import { TileStatus } from '../components/tile/useTileData';

import { fromUnixTimestampMs } from './luxonUtils';

import type { TileConfig, TileState, TileDataType } from '../services/storageManager';

/**
 * Status calculation utilities
 * Extracted from useTileData to maintain separation of concerns
 */

export interface StatusCalculationResult<T extends TileDataType> {
  status: TileStatus;
  data: T | null;
  lastUpdated: DateTime | null;
}

/**
 * Calculate tile status based on query state and result
 */
export function calculateTileStatus<T extends TileDataType>(params: {
  showLoading: boolean;
  error: unknown;
  result: TileConfig<T> | null | undefined;
  tileId: string;
  getCachedData: (tileId: string) => TileState<T> | null;
}): StatusCalculationResult<T> {
  const { showLoading, result, tileId, getCachedData } = params;

  // Show loading state when fetching and no data available
  if (showLoading) {
    return {
      status: TileStatus.Loading,
      data: null,
      lastUpdated: null,
    };
  }

  // Since dataFetcher always returns a TileConfig (never throws), result should always exist
  // But we still handle the case where it might be null/undefined for safety
  if (!result) {
    // Fallback: try to get cached data
    const cachedData = getCachedData(tileId);
    if (cachedData?.data) {
      return {
        status: TileStatus.Stale,
        data: cachedData.data,
        lastUpdated: cachedData.lastSuccessfulDataRequest
          ? fromUnixTimestampMs(cachedData.lastSuccessfulDataRequest)
          : cachedData.lastDataRequest
            ? fromUnixTimestampMs(cachedData.lastDataRequest)
            : null,
      };
    }
    return {
      status: TileStatus.Error,
      data: null,
      lastUpdated: null,
    };
  }

  const data = result.data;
  const lastUpdated = result.lastDataRequest ? fromUnixTimestampMs(result.lastDataRequest) : null;

  // Determine status based on result state
  if (result.lastDataRequestSuccessful && data) {
    return {
      status: TileStatus.Success,
      data,
      lastUpdated,
    };
  } else if (!result.lastDataRequestSuccessful && data) {
    // Stale: use lastSuccessfulDataRequest if available, otherwise fall back to lastDataRequest
    const staleLastUpdated = result.lastSuccessfulDataRequest
      ? fromUnixTimestampMs(result.lastSuccessfulDataRequest)
      : lastUpdated;
    return {
      status: TileStatus.Stale,
      data,
      lastUpdated: staleLastUpdated,
    };
  } else {
    // Error: no data and request failed
    // Use lastDataRequest for lastUpdated (shows when the failed request was made)
    return {
      status: TileStatus.Error,
      data: null,
      lastUpdated, // This will be the timestamp of the failed request
    };
  }
}
