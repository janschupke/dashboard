import type { TileDataType } from '../../../services/storageManager';
import type { TileSize } from '../../../types/tile';

// Gold and silver prices are now fetched from gold-api.com spot price endpoints.
// The tile expects a PreciousMetalsTileData object with gold and silver fields, each with price, change_24h, change_percentage_24h.
// All fields are populated from the gold-api.com response.

export interface PreciousMetalTileData extends TileDataType {
  price: number;
  change_24h: number;
  change_percentage_24h: number;
}

export interface PreciousMetalsTileData extends TileDataType {
  gold: PreciousMetalTileData;
  silver: PreciousMetalTileData;
}

export interface PreciousMetalsApiResponse {
  gold: PreciousMetalTileData;
  silver: PreciousMetalTileData;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

export interface PreciousMetalsTileConfig {
  chartPeriod?: '7d' | '30d' | '1y';
  selectedMetal?: 'gold' | 'silver';
  refreshInterval?: number;
}

export interface PreciousMetalsTileProps {
  id: string;
  size: TileSize;
  config: PreciousMetalsTileConfig;
}

export type ChartPeriod = '7d' | '30d' | '1y';
export type MetalType = 'gold' | 'silver';
