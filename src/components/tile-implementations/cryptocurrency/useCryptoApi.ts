import { useCallback } from 'react';

import { useDataServices } from '../../../contexts/DataServicesContext';
import { COINGECKO_MARKETS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';

import type { CryptocurrencyTileData } from './types';
import type { CryptoMarketsQueryParams, PathParams } from '../../../services/apiEndpoints';
import type { TileConfig } from '../../../services/storageManager';

export function useCryptoApi() {
  const { dataFetcher } = useDataServices();
  const getCryptocurrencyMarkets = useCallback(
    async (
      tileId: string,
      pathParams: PathParams,
      queryParams: CryptoMarketsQueryParams,
    ): Promise<TileConfig<CryptocurrencyTileData>> => {
      const url = buildApiUrl(COINGECKO_MARKETS_ENDPOINT, pathParams, queryParams);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await dataFetcher.fetchWithError(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.CRYPTOCURRENCY,
        { apiCall: TileApiCallTitle.CRYPTOCURRENCY },
        url,
      );
    },
    [dataFetcher],
  );
  return { getCryptocurrencyMarkets };
}
