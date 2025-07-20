import type { TileSize } from '../../../types/tile';
import type { TileDataType } from '../../../services/storageManager';
import type { BaseApiResponse } from '../../../services/dataMapper';

export interface TimeApiResponse extends BaseApiResponse {
  status: 'OK' | 'FAILED';
  message: string;
  countryCode: string;
  zoneName: string;
  abbreviation: string;
  gmtOffset: number;
  dst: '0' | '1';
  zoneStart?: number;
  zoneEnd?: number;
  nextAbbreviation?: string;
  timestamp: number;
  formatted: string;
  [key: string]: unknown;
}

export interface TimeTileData extends TileDataType {
  currentTime: string;
  date: string;
  timezone: string;
  abbreviation: string;
  offset: string;
  isBusinessHours: boolean;
  businessStatus: 'open' | 'closed' | 'opening soon' | 'closing soon';
  lastUpdate: string;
}

export interface CityConfig {
  name: string;
  timezone: string;
  abbreviation: string;
  businessHours: {
    start: number;
    end: number;
  };
}

export interface TimeTileConfig {
  city: 'helsinki' | 'prague' | 'taipei';
  timeFormat?: '12-hour' | '24-hour';
  showBusinessHours?: boolean;
  refreshInterval?: number;
}

export interface TimeTileProps {
  id: string;
  size: TileSize;
  config: TimeTileConfig;
}

export interface TimeDisplayProps {
  timeData: TimeTileData;
  timeFormat: '12-hour' | '24-hour';
  size: TileSize;
}

export interface TimezoneInfoProps {
  timeData: TimeTileData;
  size: TileSize;
}

export interface BusinessHoursProps {
  timeData: TimeTileData;
  size: TileSize;
}

export type TimeFormat = '12-hour' | '24-hour';
