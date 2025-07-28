import { useCallback } from 'react';

import { useDataServices } from '../../../contexts/DataServicesContext';
import { TIME_API_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { fetchWithError } from '../../../services/fetchWithError';
import { TileType, TileApiCallTitle } from '../../../types/tile';

import type { TimeTileData } from './types';
import type { TimeQueryParams, PathParams } from '../../../services/apiEndpoints';
import type { TileConfig } from '../../../services/storageManager';

export function useTimeApi() {
  const { dataFetcher } = useDataServices();
  const getTime = useCallback(
    async (
      tileId: string,
      pathParams: PathParams,
      queryParams: TimeQueryParams,
    ): Promise<TileConfig<TimeTileData>> => {
      const url = buildApiUrl(TIME_API_ENDPOINT, pathParams, queryParams);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetchWithError(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.TIME_TAIPEI,
        { apiCall: TileApiCallTitle.TIME },
        url,
      );
    },
    [dataFetcher],
  );
  return { getTime };
}
