import type { PreciousMetalsTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import type { TileConfig } from '../../../services/storageManager';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import { PRECIOUS_METALS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { GoldApiPathParams, QueryParams } from '../../../services/apiEndpoints';
import { fetchWithError } from '../../../services/fetchWithError';

export function usePreciousMetalsApi() {
  const { dataFetcher } = useDataServices();
  const getPreciousMetals = useCallback(
    async (
      tileId: string,
      pathParams: GoldApiPathParams,
      queryParams: QueryParams,
    ): Promise<TileConfig<PreciousMetalsTileData>> => {
      const url = buildApiUrl(PRECIOUS_METALS_ENDPOINT, pathParams, queryParams);

      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetchWithError(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.PRECIOUS_METALS,
        { apiCall: TileApiCallTitle.PRECIOUS_METALS },
        url,
      );
    },
    [dataFetcher],
  );
  return { getPreciousMetals };
}
