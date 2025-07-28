import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { ECB_EURIBOR_12M_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { EuriborQueryParams, PathParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { EuriborRateTileData } from './types';
import type { TileConfig } from '../../../services/storageManager';
import { fetchWithError } from '../../../services/fetchWithError';

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
          const response = await fetchWithError(url);
          const data = await response.json();
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
