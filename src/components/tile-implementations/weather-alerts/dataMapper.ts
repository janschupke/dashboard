import { BaseDataMapper } from '../../../services/dataMapper';
import type { WeatherAlertsApiResponse, WeatherAlertsTileData } from './types';

export class WeatherAlertsDataMapper extends BaseDataMapper<
  WeatherAlertsApiResponse,
  WeatherAlertsTileData
> {
  map(apiResponse: WeatherAlertsApiResponse): WeatherAlertsTileData {
    return { alerts: apiResponse.alerts || [] };
  }
  validate(apiResponse: unknown): apiResponse is WeatherAlertsApiResponse {
    return typeof apiResponse === 'object' && apiResponse !== null;
  }
}

export function mapWeatherAlertsApiResponse(response: WeatherAlertsApiResponse) {
  return response.alerts || [];
}
