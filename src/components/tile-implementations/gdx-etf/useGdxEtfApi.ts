import type { GdxEtfTileData } from './types';
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { ALPHA_VANTAGE_GDX_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { AlphaVantageParams } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';
import type { TileConfig } from '../../../services/storageManager';

export function useGdxEtfApi() {
  const { dataFetcher } = useDataServices();
  const getGdxEtf = useCallback(
    async (
      tileId: string,
      params: AlphaVantageParams,
      forceRefresh = false,
    ): Promise<TileConfig<GdxEtfTileData>> => {
      const url = buildApiUrl<AlphaVantageParams>(ALPHA_VANTAGE_GDX_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetch(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.GDX_ETF,
        { apiCall: TileApiCallTitle.GDX_ETF, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getGdxEtf };
}
