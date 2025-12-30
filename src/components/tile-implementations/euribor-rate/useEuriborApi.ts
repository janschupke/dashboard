import { useCallback } from 'react';

import { useDataServices } from '../../../contexts/DataServicesContext';
import { ECB_EURIBOR_12M_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';

import type { EuriborRateTileData } from './types';
import type { EuriborQueryParams, PathParams } from '../../../services/apiEndpoints';
import type { TileConfig } from '../../../services/storageManager';

export function useEuriborApi() {
  const { dataFetcher } = useDataServices();
  const getEuriborRate = useCallback(
    async (
      tileId: string,
      pathParams: PathParams,
      queryParams: EuriborQueryParams,
    ): Promise<TileConfig<EuriborRateTileData>> => {
      const url = buildApiUrl(ECB_EURIBOR_12M_ENDPOINT, pathParams, queryParams);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await dataFetcher.fetchWithError(url);
          const data = (await response.json()) as unknown;
          return { data, status: response.status };
        },
        tileId,
        TileType.EURIBOR_RATE,
        { apiCall: TileApiCallTitle.EURIBOR_RATE },
        url,
      );
    },
    [dataFetcher],
  );
  return { getEuriborRate };
}
