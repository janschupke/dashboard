import type { UraniumTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { URANIUM_HTML_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { UraniumHtmlParams } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';
import type { TileConfig } from '../../../services/storageManager';

export function useUraniumApi() {
  const { dataFetcher } = useDataServices();
  const getUraniumPrice = useCallback(
    async (
      tileId: string,
      params: UraniumHtmlParams,
      forceRefresh = false,
    ): Promise<TileConfig<UraniumTileData>> => {
      const url = buildApiUrl<UraniumHtmlParams>(URANIUM_HTML_ENDPOINT, params);

      return dataFetcher.fetchAndParse(
        async () => {
          const response = await fetch(url);
          const data = await response.text();
          return { data, status: response.status };
        },
        tileId,
        TileType.URANIUM,
        { apiCall: TileApiCallTitle.URANIUM, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getUraniumPrice };
}
