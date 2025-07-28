import type { BaseApiResponse } from '../../../services/dataMapper';
import type { TileDataType } from '../../../services/storageManager';

export interface EuriborRateTileData extends TileDataType {
  currentRate: number;
  lastUpdate: Date;
  historicalData: EuriborRateHistoryEntry[];
}

export interface EuriborRateHistoryEntry {
  date: Date;
  rate: number;
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '5Y' | 'Max';

// ECB 12-month Euribor endpoint returns a structure with dataSets and structure fields.
export interface EuriborRateApiResponse extends BaseApiResponse {
  dataSets: unknown[];
  structure: unknown;
}

export interface EuriborRateConfig {
  EMMI_API_BASE: string;
  ECB_API_BASE: string;
  CACHE_DURATION: number;
  DEFAULT_REFRESH_INTERVAL: number;
  DEFAULT_TIME_RANGE: TimeRange;
}

export interface EuriborRateErrorMessages {
  FETCH_FAILED: string;
  API_ERROR: string;
  NETWORK_ERROR: string;
  SCRAPING_FAILED: string;
  NO_DATA: string;
}
