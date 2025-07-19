import type { GdxEtfApiResponse, GdxEtfTileData } from './types';
import type { DataMapper } from '../../../services/dataMapper';

/**
 * Maps GDX ETF API response to GdxEtfTileData for the tile.
 */
export const gdxEtfDataMapper: DataMapper<GdxEtfApiResponse, GdxEtfTileData> = {
  map: (apiResponse: GdxEtfApiResponse): GdxEtfTileData => {
    // Only handle Alpha Vantage GLOBAL_QUOTE response format
    const globalQuote = apiResponse['Global Quote'];
    if (!globalQuote) {
      throw new Error('No Global Quote data found in API response');
    }
    if (!globalQuote['01. symbol'] || !globalQuote['05. price']) {
      throw new Error('Missing required fields in Global Quote data');
    }
    return {
      symbol: globalQuote['01. symbol'],
      name: 'VanEck Gold Miners ETF',
      currentPrice: parseFloat(globalQuote['05. price']),
      previousClose: parseFloat(globalQuote['08. previous close'] || '0'),
      priceChange: parseFloat(globalQuote['09. change'] || '0'),
      priceChangePercent: parseFloat(globalQuote['10. change percent']?.replace('%', '') || '0'),
      volume: parseInt(globalQuote['06. volume'] || '0'),
      marketCap: 0, // Alpha Vantage doesn't provide market cap in GLOBAL_QUOTE
      high: parseFloat(globalQuote['03. high'] || '0'),
      low: parseFloat(globalQuote['04. low'] || '0'),
      open: parseFloat(globalQuote['02. open'] || '0'),
      lastUpdated: globalQuote['07. latest trading day'] || '',
      tradingStatus: 'open' as const,
    };
  },
  safeMap(apiResponse: GdxEtfApiResponse): GdxEtfTileData {
    try {
      return this.map(apiResponse);
    } catch (error) {
      throw new Error(
        `Failed to map GDX ETF data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },
  validate: (data: unknown): data is GdxEtfApiResponse => {
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    const response = data as GdxEtfApiResponse;
    // Only validate Alpha Vantage GLOBAL_QUOTE format
    if (!response['Global Quote']) {
      return false;
    }
    const globalQuote = response['Global Quote'];
    return (
      typeof globalQuote['01. symbol'] === 'string' &&
      typeof globalQuote['05. price'] === 'string' &&
      globalQuote['01. symbol'].length > 0 &&
      globalQuote['05. price'].length > 0
    );
  },
};
