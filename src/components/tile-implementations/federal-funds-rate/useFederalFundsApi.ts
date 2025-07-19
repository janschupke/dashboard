import type { FederalFundsRateTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { FRED_SERIES_OBSERVATIONS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { FredParams } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';
import type { TileConfig } from '../../../services/storageManager';

/**
 * Fetches Federal Funds Rate data from FRED.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for FRED endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<TileConfig<FederalFundsRateTileData>>
 */
export function useFederalFundsApi() {
  const { dataFetcher } = useDataServices();
  const getFederalFundsRate = useCallback(
    async (
      tileId: string,
      params: FredParams,
      forceRefresh = false,
    ): Promise<TileConfig<FederalFundsRateTileData>> => {
      const url = buildApiUrl<FredParams>(FRED_SERIES_OBSERVATIONS_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetch(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.FEDERAL_FUNDS_RATE,
        { apiCall: TileApiCallTitle.FEDERAL_FUNDS_RATE, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getFederalFundsRate };
}
