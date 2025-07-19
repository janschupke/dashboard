import type { TyphoonTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { CWB_TYPHOON_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';
import { useCallback } from 'react';
import type { TileConfig } from '../../../services/storageManager';

export function useTyphoonApi() {
  const { dataFetcher } = useDataServices();
  const getTyphoonData = useCallback(
    async (
      tileId: string,
      apiKey: string,
      forceRefresh = false,
    ): Promise<TileConfig<TyphoonTileData>> => {
      const params = { Authorization: apiKey, format: 'JSON' as const };
      const url = buildApiUrl(CWB_TYPHOON_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetch(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.TYPHOON,
        { apiCall: TileApiCallTitle.TYPHOON, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getTyphoonData };
}
