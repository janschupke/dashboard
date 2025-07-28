import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { ALPHA_VANTAGE_GDX_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { AlphaVantageQueryParams, PathParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { GdxEtfTileData } from './types';
import type { TileConfig } from '../../../services/storageManager';
import { fetchWithError } from '../../../services/fetchWithError';

export function useGdxEtfApi() {
  const { dataFetcher } = useDataServices();
  const getGdxEtf = useCallback(
    async (
      tileId: string,
      pathParams: PathParams,
      queryParams: AlphaVantageQueryParams,
    ): Promise<TileConfig<GdxEtfTileData>> => {
      const url = buildApiUrl(ALPHA_VANTAGE_GDX_ENDPOINT, pathParams, queryParams);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetchWithError(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.GDX_ETF,
        { apiCall: TileApiCallTitle.GDX_ETF },
        url,
      );
    },
    [dataFetcher],
  );
  return { getGdxEtf };
}
