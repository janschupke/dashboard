import { BaseDataMapper } from '../../../services/dataMapper';

import type { PreciousMetalsApiResponse, PreciousMetalsTileData } from './types';

export class PreciousMetalsDataMapper extends BaseDataMapper<
  PreciousMetalsApiResponse,
  PreciousMetalsTileData
> {
  map(apiResponse: PreciousMetalsApiResponse): PreciousMetalsTileData {
    return {
      gold: apiResponse.gold,
      silver: apiResponse.silver,
    };
  }

  validate(apiResponse: unknown): apiResponse is PreciousMetalsApiResponse {
    return (
      !!apiResponse &&
      typeof apiResponse === 'object' &&
      'gold' in apiResponse &&
      'silver' in apiResponse &&
      typeof (apiResponse as { gold: unknown }).gold === 'object' &&
      typeof (apiResponse as { silver: unknown }).silver === 'object' &&
      (apiResponse as { gold: { price?: unknown } }).gold?.price !== undefined &&
      typeof (apiResponse as { gold: { price: unknown } }).gold.price === 'number' &&
      // Allow change_24h and change_percentage_24h to be 0 or missing
      ((apiResponse as { gold: { change_24h?: unknown } }).gold.change_24h === undefined ||
        typeof (apiResponse as { gold: { change_24h: unknown } }).gold.change_24h === 'number')
    );
  }
}
