import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { FRED_SERIES_OBSERVATIONS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { FredParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { FederalFundsRateTileData } from './types';
import type { TileConfig } from '../../../services/storageManager';
import { fetchWithError } from '../../../services/fetchWithError';

export function useFederalFundsApi() {
  const { dataFetcher } = useDataServices();
  const getFederalFundsRate = useCallback(
    /**
     * Fetches Federal Funds Rate data from FRED API
     * @param tileId - Unique identifier for the tile
     * @param params - FRED API parameters
     * @returns Promise resolving to tile configuration with Federal Funds Rate data
     */
    async (tileId: string, params: FredParams): Promise<TileConfig<FederalFundsRateTileData>> => {
      const url = buildApiUrl<FredParams>(FRED_SERIES_OBSERVATIONS_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetchWithError(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.FEDERAL_FUNDS_RATE,
        { apiCall: TileApiCallTitle.FEDERAL_FUNDS_RATE },
        url,
      );
    },
    [dataFetcher],
  );
  return { getFederalFundsRate };
}
