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
  const { showLoading, error, result, tileId, getCachedData } = params;

  // Show loading state when fetching and no data available
  if (showLoading) {
    return {
      status: TileStatus.Loading,
      data: null,
      lastUpdated: null,
    };
  }

  if (error || !result) {
    // Try to get cached data on error
    const cachedData = getCachedData(tileId);
    if (cachedData?.data) {
      return {
        status: TileStatus.Stale,
        data: cachedData.data,
        lastUpdated: cachedData.lastDataRequest
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
      data: null,
      lastUpdated: null,
    };
  }
}
