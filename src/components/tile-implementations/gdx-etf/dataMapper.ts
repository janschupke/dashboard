import { ALPHA_VANTAGE_FIELDS } from '../../../constants/apiFields';
import { TradingStatus } from '../../../constants/enums';
import { ERROR_MESSAGES } from '../../../constants/errorMessages';
import type { GdxEtfApiResponse, GdxEtfTileData } from './types';
import type { DataMapper } from '../../../services/dataMapper';

/**
 * Maps GDX ETF API response to GdxEtfTileData for the tile.
 */
export const gdxEtfDataMapper: DataMapper<GdxEtfApiResponse, GdxEtfTileData> = {
  map: (apiResponse: GdxEtfApiResponse): GdxEtfTileData => {
    // Only handle Alpha Vantage GLOBAL_QUOTE response format
    const globalQuote = apiResponse[ALPHA_VANTAGE_FIELDS.GLOBAL_QUOTE];
    if (!globalQuote) {
      throw new Error(ERROR_MESSAGES.API.NO_GLOBAL_QUOTE);
    }
    if (!globalQuote[ALPHA_VANTAGE_FIELDS.SYMBOL] || !globalQuote[ALPHA_VANTAGE_FIELDS.PRICE]) {
      throw new Error(ERROR_MESSAGES.API.MISSING_REQUIRED_FIELDS);
    }
    return {
      symbol: globalQuote[ALPHA_VANTAGE_FIELDS.SYMBOL],
      name: 'VanEck Gold Miners ETF', // TODO: Move to i18n when dataMapper supports it
      currentPrice: parseFloat(globalQuote[ALPHA_VANTAGE_FIELDS.PRICE]),
      previousClose: parseFloat(globalQuote[ALPHA_VANTAGE_FIELDS.PREVIOUS_CLOSE] || '0'),
      priceChange: parseFloat(globalQuote[ALPHA_VANTAGE_FIELDS.CHANGE] || '0'),
      priceChangePercent: parseFloat(
        globalQuote[ALPHA_VANTAGE_FIELDS.CHANGE_PERCENT]?.replace('%', '') || '0',
      ),
      volume: parseInt(globalQuote[ALPHA_VANTAGE_FIELDS.VOLUME] || '0'),
      marketCap: 0, // Alpha Vantage doesn't provide market cap in GLOBAL_QUOTE
      high: parseFloat(globalQuote[ALPHA_VANTAGE_FIELDS.HIGH] || '0'),
      low: parseFloat(globalQuote[ALPHA_VANTAGE_FIELDS.LOW] || '0'),
      open: parseFloat(globalQuote[ALPHA_VANTAGE_FIELDS.OPEN] || '0'),
      lastUpdated: globalQuote[ALPHA_VANTAGE_FIELDS.LATEST_TRADING_DAY] || '',
      tradingStatus: TradingStatus.OPEN,
    };
  },
  safeMap(apiResponse: GdxEtfApiResponse): GdxEtfTileData {
    try {
      return this.map(apiResponse);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(ERROR_MESSAGES.API.MAPPING_FAILED(errorMessage));
    }
  },
  validate: (data: unknown): data is GdxEtfApiResponse => {
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    const response = data as GdxEtfApiResponse;
    // Only validate Alpha Vantage GLOBAL_QUOTE format
    const globalQuote = response[ALPHA_VANTAGE_FIELDS.GLOBAL_QUOTE];
    if (!globalQuote) {
      return false;
    }
    return (
      typeof globalQuote[ALPHA_VANTAGE_FIELDS.SYMBOL] === 'string' &&
      typeof globalQuote[ALPHA_VANTAGE_FIELDS.PRICE] === 'string' &&
      globalQuote[ALPHA_VANTAGE_FIELDS.SYMBOL].length > 0 &&
      globalQuote[ALPHA_VANTAGE_FIELDS.PRICE].length > 0
    );
  },
};
