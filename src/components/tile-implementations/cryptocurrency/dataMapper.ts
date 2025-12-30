import { BaseDataMapper } from '../../../services/dataMapper';

import type { CryptocurrencyApiResponse, CryptocurrencyTileData } from './types';

export class CryptocurrencyDataMapper extends BaseDataMapper<
  CryptocurrencyApiResponse[],
  CryptocurrencyTileData
> {
  map(apiResponse: CryptocurrencyApiResponse[]): CryptocurrencyTileData {
    return {
      coins: Array.isArray(apiResponse) ? apiResponse : [],
    };
  }

  validate(apiResponse: unknown): apiResponse is CryptocurrencyApiResponse[] {
    if (!Array.isArray(apiResponse)) {
      return false;
    }
    return apiResponse.every((coin): coin is CryptocurrencyApiResponse => {
      return (
        typeof coin === 'object' &&
        coin !== null &&
        'id' in coin &&
        'symbol' in coin &&
        'name' in coin &&
        'current_price' in coin &&
        typeof (coin as { id: unknown }).id === 'string' &&
        typeof (coin as { symbol: unknown }).symbol === 'string' &&
        typeof (coin as { name: unknown }).name === 'string' &&
        typeof (coin as { current_price: unknown }).current_price === 'number'
      );
    });
  }
}
