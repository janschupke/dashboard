import { useCallback } from 'react';

import { useDataServices } from '../../../contexts/DataServicesContext';
import { OPENWEATHERMAP_ONECALL_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { fetchWithError } from '../../../services/fetchWithError';
import { TileType, TileApiCallTitle } from '../../../types/tile';

import type { WeatherTileData } from './types';
import type { WeatherQueryParams, PathParams } from '../../../services/apiEndpoints';
import type { TileConfig } from '../../../services/storageManager';

export function useWeatherApi() {
  const { dataFetcher } = useDataServices();
  const getWeather = useCallback(
    async (
      tileId: string,
      pathParams: PathParams,
      queryParams: WeatherQueryParams,
    ): Promise<TileConfig<WeatherTileData>> => {
      const url = buildApiUrl(OPENWEATHERMAP_ONECALL_ENDPOINT, pathParams, queryParams);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetchWithError(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.WEATHER_HELSINKI,
        { apiCall: TileApiCallTitle.WEATHER },
        url,
      );
    },
    [dataFetcher],
  );
  return { getWeather };
}
