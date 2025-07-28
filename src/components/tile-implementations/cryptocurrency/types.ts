import type { BaseApiResponse } from '../../../services/dataMapper';
import type { TileDataType } from '../../../services/storageManager';
import type { TileSize } from '../../../types/tile';

export interface CryptocurrencyApiResponse extends BaseApiResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_24h: number;
  total_volume: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  atl: number;
  atl_change_percentage: number;
  last_updated: string;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

export interface CryptocurrencyTileConfig {
  chartPeriod?: '7d' | '30d' | '1y';
  selectedCoin?: string;
  refreshInterval?: number;
}

export interface CryptocurrencyTileProps {
  id: string;
  size: TileSize;
  config: CryptocurrencyTileConfig;
}

export interface CryptocurrencyTileData extends TileDataType {
  coins: CryptocurrencyApiResponse[];
}

export type ChartPeriod = '7d' | '30d' | '1y';
export type CoinId = string;
