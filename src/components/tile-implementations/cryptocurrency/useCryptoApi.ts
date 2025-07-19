import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { COINGECKO_MARKETS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { CryptoMarketsParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { CryptocurrencyTileData } from './types';
import type { TileConfig } from '../../../services/storageManager';

export function useCryptoApi() {
  const { dataFetcher } = useDataServices();
  const getCryptocurrencyMarkets = useCallback(
    async (
      tileId: string,
      params: CryptoMarketsParams,
      forceRefresh = false,
    ): Promise<TileConfig<CryptocurrencyTileData>> => {
      const url = buildApiUrl<CryptoMarketsParams>(COINGECKO_MARKETS_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetch(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.CRYPTOCURRENCY,
        { apiCall: TileApiCallTitle.CRYPTOCURRENCY, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getCryptocurrencyMarkets };
}
