import { TileType } from '../../../types/tile';

export const CITY_CONFIG = {
  [TileType.TIME_HELSINKI]: { city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
  [TileType.TIME_PRAGUE]: { city: 'Prague', lat: 50.0755, lng: 14.4378 },
  [TileType.TIME_TAIPEI]: { city: 'Taipei', lat: 25.033, lng: 121.5654 },
} as const;
