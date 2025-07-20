import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { ECB_EURIBOR_12M_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { EuriborParams } from '../../../services/apiEndpoints';
import type { EuriborRateTileData } from './types';
import type { TileConfig } from '../../../services/storageManager';
import { fetchWithError } from '../../../services/fetchWithError';

export function useEuriborApi() {
  const { dataFetcher } = useDataServices();
  const getEuriborRate = useCallback(
    async (
      tileId: string,
      params: EuriborParams,
      forceRefresh = false,
    ): Promise<TileConfig<EuriborRateTileData>> => {
      const url = buildApiUrl<EuriborParams>(ECB_EURIBOR_12M_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetchWithError(url);
          const data = await response.text();
          return { data, status: response.status };
        },
        tileId,
        TileType.EURIBOR_RATE,
        { apiCall: TileApiCallTitle.EURIBOR_RATE, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getEuriborRate };
}
