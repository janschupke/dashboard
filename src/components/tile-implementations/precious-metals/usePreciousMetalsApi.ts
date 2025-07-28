import type { PreciousMetalsTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import type { TileConfig } from '../../../services/storageManager';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import { PRECIOUS_METALS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { GoldApiParams } from '../../../services/apiEndpoints';
import { fetchWithError } from '../../../services/fetchWithError';

export function usePreciousMetalsApi() {
  const { dataFetcher } = useDataServices();
  const getPreciousMetals = useCallback(
    async (tileId: string, params: GoldApiParams): Promise<TileConfig<PreciousMetalsTileData>> => {
      const url = buildApiUrl<GoldApiParams>(PRECIOUS_METALS_ENDPOINT, params);

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
