import type { BaseApiResponse } from '../../../services/dataMapper';
import type { TileDataType } from '../../../services/storageManager';
import type { TileSize } from '../../../types/tile';

export interface FederalFundsRateTileData extends TileDataType {
  currentRate: number;
  lastUpdate: Date;
  historicalData: FederalFundsRateHistoryEntry[];
}

export interface FederalFundsRateHistoryEntry {
  date: Date;
  rate: number;
}

export interface FederalFundsRateTileConfig {
  timeRange?: TimeRange;
  refreshInterval?: number;
}

export interface FederalFundsRateTileProps {
  id: string;
  size: TileSize;
  config: FederalFundsRateTileConfig;
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '5Y' | 'Max';

export interface FederalFundsRateApiResponse extends BaseApiResponse {
  observations: Array<{
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
  }>;
}

export interface ScrapedRateData {
  rate: number;
  date: string;
}
