import { useCallback } from 'react';

import { useDataServices } from '../../../contexts/DataServicesContext';
import { USGS_EARTHQUAKE_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { fetchWithError } from '../../../services/fetchWithError';
import { TileType, TileApiCallTitle } from '../../../types/tile';

import type { EarthquakeTileData } from './types';
import type { UsgsEarthquakeQueryParams, PathParams } from '../../../services/apiEndpoints';
import type { TileConfig, TileDataType } from '../../../services/storageManager';

// Wrapper type for array
export interface EarthquakeTileDataArray extends TileDataType {
  items: EarthquakeTileData[];
}

export function useEarthquakeApi() {
  const { dataFetcher } = useDataServices();
  const getEarthquakes = useCallback(
    async (
      tileId: string,
      pathParams: PathParams,
      queryParams: UsgsEarthquakeQueryParams,
    ): Promise<TileConfig<EarthquakeTileDataArray>> => {
      const url = buildApiUrl(USGS_EARTHQUAKE_ENDPOINT, pathParams, queryParams);
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
