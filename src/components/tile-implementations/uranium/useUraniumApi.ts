import { useCallback } from 'react';

import { useDataServices } from '../../../contexts/DataServicesContext';
import { URANIUM_HTML_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';

import type { UraniumTileData } from './types';
import type { UraniumHtmlQueryParams, PathParams } from '../../../services/apiEndpoints';
import type { TileConfig } from '../../../services/storageManager';

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
          const response = await dataFetcher.fetchWithError(url);
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
