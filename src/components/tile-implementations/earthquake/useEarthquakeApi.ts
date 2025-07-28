import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { USGS_EARTHQUAKE_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { UsgsEarthquakeParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { EarthquakeTileData } from './types';
import type { TileConfig, TileDataType } from '../../../services/storageManager';
import { fetchWithError } from '../../../services/fetchWithError';

// Wrapper type for array
export interface EarthquakeTileDataArray extends TileDataType {
  items: EarthquakeTileData[];
}

export function useEarthquakeApi() {
  const { dataFetcher } = useDataServices();
  const getEarthquakes = useCallback(
    async (
      tileId: string,
      params: UsgsEarthquakeParams,
    ): Promise<TileConfig<EarthquakeTileDataArray>> => {
      const url = buildApiUrl<UsgsEarthquakeParams>(USGS_EARTHQUAKE_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetchWithError(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.EARTHQUAKE,
        { apiCall: TileApiCallTitle.EARTHQUAKE },
        url,
      );
    },
    [dataFetcher],
  );
  return { getEarthquakes };
}
