import { BaseDataMapper } from '../../../services/dataMapper';
import type { BaseApiResponse } from '../../../services/dataMapper';
import type { PreciousMetalsTileData } from './types';

interface GoldApiResponse extends BaseApiResponse {
  name: string;
  price: number;
  symbol: string;
  updatedAt: string;
  updatedAtReadable: string;
}

export class PreciousMetalsDataMapper extends BaseDataMapper<
  GoldApiResponse,
  PreciousMetalsTileData
> {
  map(apiResponse: GoldApiResponse): PreciousMetalsTileData {
    return {
      gold: {
        price: apiResponse.price,
        change_24h: 0, // API doesn't provide 24h change data
        change_percentage_24h: 0, // API doesn't provide 24h change data
      },
      silver: {
        price: 0, // Only gold data available
        change_24h: 0,
        change_percentage_24h: 0,
      },
    };
  }

  validate(apiResponse: unknown): apiResponse is GoldApiResponse {
    return (
      !!apiResponse &&
      typeof apiResponse === 'object' &&
      'price' in apiResponse &&
      typeof (apiResponse as { price: unknown }).price === 'number'
    );
  }
}
