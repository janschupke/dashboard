import type { TileDataType } from '../../../services/storageManager';

export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags?: string[];
}

export type WeatherAlertsApiResponse = {
  alerts?: WeatherAlert[];
};

export interface WeatherAlertsTileData extends TileDataType {
  alerts: WeatherAlert[];
}
