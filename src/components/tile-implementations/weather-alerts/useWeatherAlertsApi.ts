import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { OPENWEATHERMAP_ALERTS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { WeatherQueryParams, PathParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { WeatherAlertsTileData, WeatherAlertsApiResponse } from './types';
import type { TileConfig } from '../../../services/storageManager';
import { fetchWithError } from '../../../services/fetchWithError';

export function useWeatherAlertsApi() {
  const { dataFetcher } = useDataServices();
  const getWeatherAlerts = useCallback(
    async (
      tileId: string,
      pathParams: PathParams,
      queryParams: WeatherQueryParams,
    ): Promise<TileConfig<WeatherAlertsTileData>> => {
      const url = buildApiUrl(OPENWEATHERMAP_ALERTS_ENDPOINT, pathParams, queryParams);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetchWithError(url);
          const data: WeatherAlertsApiResponse = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.WEATHER_ALERTS,
        { apiCall: TileApiCallTitle.WEATHER_ALERTS },
        url,
      );
    },
    [dataFetcher],
  );
  return { getWeatherAlerts };
}
