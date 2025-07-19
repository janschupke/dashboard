import { BaseDataMapper } from '../../../services/dataMapper';
import type { WeatherTileData, WeatherApiResponse, WeatherForecast } from './types';

// Relax the constraint for WeatherApiResponse
export class WeatherDataMapper extends BaseDataMapper<WeatherApiResponse, WeatherTileData> {
  map(apiResponse: WeatherApiResponse): WeatherTileData {
    const current = apiResponse.current;
    const weather = current.weather[0];
    const daily: WeatherForecast[] = Array.isArray(apiResponse.daily)
      ? apiResponse.daily.map((day) => ({
          date: new Date(day.dt * 1000).toISOString(),
          temperature: {
            min: day.temp.min,
            max: day.temp.max,
          },
          conditions: {
            main: day.weather[0]?.main || 'Unknown',
            description: day.weather[0]?.description || '',
            icon: day.weather[0]?.icon || '',
          },
          humidity: day.humidity,
          wind: {
            speed: day.wind_speed,
          },
        }))
      : [];

    return {
      city: 'Helsinki', // Default city, could be configurable
      country: 'Finland',
      temperature: {
        current: current.temp,
        feels_like: current.feels_like,
        min: 0, // Not available in current API response
        max: 0, // Not available in current API response
      },
      conditions: {
        main: weather.main,
        description: weather.description,
        icon: weather.icon,
      },
      humidity: current.humidity,
      wind: {
        speed: current.wind_speed,
        direction: current.wind_deg,
      },
      pressure: current.pressure,
      visibility: current.visibility,
      timestamp: current.dt * 1000, // Convert to milliseconds
      daily,
    };
  }

  validate(apiResponse: unknown): apiResponse is WeatherApiResponse {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return false;
    }

    const response = apiResponse as Record<string, unknown>;

    // Check for required fields
    if (!response.current || typeof response.current !== 'object') {
      return false;
    }

    const current = response.current as Record<string, unknown>;

    // Check required current fields
    const requiredCurrentFields = [
      'temp',
      'feels_like',
      'humidity',
      'wind_speed',
      'wind_deg',
      'pressure',
      'visibility',
      'weather',
      'dt',
    ];

    for (const field of requiredCurrentFields) {
      if (!(field in current)) {
        return false;
      }
    }

    // Validate weather array
    if (!Array.isArray(current.weather) || current.weather.length === 0) {
      return false;
    }

    const weather = current.weather[0] as Record<string, unknown>;
    const requiredWeatherFields = ['main', 'description', 'icon'];

    for (const field of requiredWeatherFields) {
      if (!(field in weather)) {
        return false;
      }
    }

    // Validate data types
    return (
      typeof current.temp === 'number' &&
      typeof current.feels_like === 'number' &&
      typeof current.humidity === 'number' &&
      typeof current.wind_speed === 'number' &&
      typeof current.wind_deg === 'number' &&
      typeof current.pressure === 'number' &&
      typeof current.visibility === 'number' &&
      typeof current.dt === 'number' &&
      typeof weather.main === 'string' &&
      typeof weather.description === 'string' &&
      typeof weather.icon === 'string'
    );
  }
}
