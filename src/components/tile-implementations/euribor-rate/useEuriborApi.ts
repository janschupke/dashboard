import { ECB_EURIBOR_12M_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { EuriborParams } from '../../../services/apiEndpoints';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { TileApiCallTitle, TileType } from '../../../types/tile';
import type { TileConfig } from '../../../services/storageManager';
import type { EuriborRateTileData } from './types';

export function useEuriborApi() {
  const { dataFetcher } = useDataServices();
  const getEuriborRate = useCallback(
    async (
      tileId: string,
      params: EuriborParams,
      forceRefresh = false,
    ): Promise<TileConfig<EuriborRateTileData>> => {
      // Use ECB 12-month Euribor endpoint
      const url = buildApiUrl<EuriborParams>(ECB_EURIBOR_12M_ENDPOINT, params) + '?format=json';
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetch(url);
          const data = await response.json();
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
