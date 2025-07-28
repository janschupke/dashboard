import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { TIME_API_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { TimeParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { TimeTileData } from './types';
import type { TileConfig } from '../../../services/storageManager';
import { fetchWithError } from '../../../services/fetchWithError';

export function useTimeApi() {
  const { dataFetcher } = useDataServices();
  const getTime = useCallback(
    async (tileId: string, params: TimeParams): Promise<TileConfig<TimeTileData>> => {
      const url = buildApiUrl<TimeParams>(TIME_API_ENDPOINT, params);
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
