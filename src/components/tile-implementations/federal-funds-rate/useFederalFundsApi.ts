import { useCallback } from 'react';

import { useDataServices } from '../../../contexts/DataServicesContext';
import { FRED_SERIES_OBSERVATIONS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';

import type { FederalFundsRateTileData } from './types';
import type { FredQueryParams, PathParams } from '../../../services/apiEndpoints';
import type { TileConfig } from '../../../services/storageManager';

export function useFederalFundsApi(): {
  getFederalFundsRate: (
    tileId: string,
    pathParams: PathParams,
    queryParams: FredQueryParams,
  ) => Promise<TileConfig<FederalFundsRateTileData>>;
} {
  const { dataFetcher } = useDataServices();
  const getFederalFundsRate = useCallback(
    /**
     * Fetches Federal Funds Rate data from FRED API
     * @param tileId - Unique identifier for the tile
     * @param pathParams - Path parameters for the API call
     * @param queryParams - Query parameters for the API call
     * @returns Promise resolving to tile configuration with Federal Funds Rate data
     */
    async (
      tileId: string,
      pathParams: PathParams,
      queryParams: FredQueryParams,
    ): Promise<TileConfig<FederalFundsRateTileData>> => {
      const url = buildApiUrl(FRED_SERIES_OBSERVATIONS_ENDPOINT, pathParams, queryParams);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await dataFetcher.fetchWithError(url);
          const data = (await response.json()) as unknown;
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
