import type { TimeTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { TIME_API_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { TimeParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { TileConfig } from '../../../services/storageManager';

export function useTimeApi() {
  const { dataFetcher } = useDataServices();
  const getTime = useCallback(
    async (
      tileId: string,
      params: TimeParams,
      tileType: TileType = TileType.TIME_HELSINKI,
      forceRefresh = false,
    ): Promise<TileConfig<TimeTileData>> => {
      const url = buildApiUrl<TimeParams>(TIME_API_ENDPOINT, params);

      return dataFetcher.fetchAndParse(
        async () => {
          const response = await fetch(url, {
            method: TIME_API_ENDPOINT.method || 'GET',
            headers: TIME_API_ENDPOINT.headers || {}
          });
          const data = await response.json();
          
          // Return the raw GitHub API response for the parser to handle
          return { data, status: response.status };
        },
        tileId,
        tileType,
        { apiCall: TileApiCallTitle.TIME, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getTime };
}
