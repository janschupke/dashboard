import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { OPENWEATHERMAP_ONECALL_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { WeatherParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { WeatherTileData } from './types';
import type { TileConfig } from '../../../services/storageManager';

export function useWeatherApi() {
  const { dataFetcher } = useDataServices();
  const getWeather = useCallback(
    async (
      tileId: string,
      params: WeatherParams,
      forceRefresh = false,
    ): Promise<TileConfig<WeatherTileData>> => {
      const url = buildApiUrl<WeatherParams>(OPENWEATHERMAP_ONECALL_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetch(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.WEATHER_HELSINKI,
        { apiCall: TileApiCallTitle.WEATHER, forceRefresh },
      );
    },
    [dataFetcher],
  );
  return { getWeather };
}
