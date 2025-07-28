import type { UraniumTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { URANIUM_HTML_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { UraniumHtmlQueryParams, PathParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { TileConfig } from '../../../services/storageManager';
import { fetchWithError } from '../../../services/fetchWithError';

export function useUraniumApi() {
  const { dataFetcher } = useDataServices();
  const getUraniumPrice = useCallback(
    async (
      tileId: string,
      pathParams: PathParams,
      queryParams: UraniumHtmlQueryParams,
    ): Promise<TileConfig<UraniumTileData>> => {
      const url = buildApiUrl(URANIUM_HTML_ENDPOINT, pathParams, queryParams);
      return dataFetcher.fetchAndParse(
        async () => {
          const response = await fetchWithError(url);
          const data = await response.text();
          return { data, status: response.status };
        },
        tileId,
        TileType.URANIUM,
        { apiCall: TileApiCallTitle.URANIUM },
        url,
      );
    },
    [dataFetcher],
  );
  return { getUraniumPrice };
}
