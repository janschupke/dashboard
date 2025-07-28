import { TileType as TileTypeEnum } from '../../../types/tile';

import type { TileType } from '../../../types/tile';

export interface WeatherCityConfig {
  lat: number;
  lon: number;
  city: string;
  country: string;
}

export const WEATHER_CITY_CONFIGS = {
  [TileTypeEnum.WEATHER_HELSINKI]: {
    lat: 60.1699,
    lon: 24.9384,
    city: 'Helsinki',
    country: 'Finland',
  },
  [TileTypeEnum.WEATHER_PRAGUE]: {
    lat: 50.0755,
    lon: 14.4378,
    city: 'Prague',
    country: 'Czech Republic',
  },
  [TileTypeEnum.WEATHER_TAIPEI]: {
    lat: 25.033,
    lon: 121.5654,
    city: 'Taipei',
    country: 'Taiwan',
  },
} as const satisfies Record<string, WeatherCityConfig>;

export function getWeatherCityConfig(tileType: TileType): WeatherCityConfig {
  const config = (WEATHER_CITY_CONFIGS as Record<string, WeatherCityConfig>)[tileType];

  if (config === undefined) {
    console.error(`No weather city config found for tile type: ${tileType}`);
    return WEATHER_CITY_CONFIGS[TileTypeEnum.WEATHER_HELSINKI];
  }

  return config;
}
