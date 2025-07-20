import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { OPENWEATHERMAP_ALERTS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { WeatherParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { WeatherAlertsTileData, WeatherAlertsApiResponse } from './types';
import type { TileConfig } from '../../../services/storageManager';
import { fetchWithError } from '../../../services/fetchWithError';
import { mapWeatherAlertsApiResponse } from './dataMapper';

export function useWeatherAlertsApi() {
  const { dataFetcher } = useDataServices();
  const getWeatherAlerts = useCallback(
    async (
      tileId: string,
      params: WeatherParams,
      forceRefresh = false,
    ): Promise<TileConfig<WeatherAlertsTileData>> => {
      const url = buildApiUrl<WeatherParams>(OPENWEATHERMAP_ALERTS_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetchWithError(url);
          const data: WeatherAlertsApiResponse = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.WEATHER_ALERTS,
        { apiCall: TileApiCallTitle.WEATHER_ALERTS, forceRefresh },
        url,
      ).then((tileConfig) => ({
        ...tileConfig,
        data: { alerts: mapWeatherAlertsApiResponse(tileConfig.data as WeatherAlertsApiResponse) },
      }));
    },
    [dataFetcher],
  );
  return { getWeatherAlerts };
} 
