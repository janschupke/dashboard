import type { WeatherAlertsApiResponse, WeatherAlert } from './types';

export function mapWeatherAlertsApiResponse(response: WeatherAlertsApiResponse): WeatherAlert[] {
  return response.alerts || [];
}
