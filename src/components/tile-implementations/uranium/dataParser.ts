import { BaseDataParser } from '../../../services/dataParser';
import type { UraniumTileData } from './types';

/**
 * Parses Trading Economics HTML to UraniumTileData for the tile.
 */
export class UraniumHtmlDataParser extends BaseDataParser<string, UraniumTileData> {
  parse(html: string): UraniumTileData {
    // TODO: Implement real parsing logic
    // For demonstration, use regex to extract mock values (real implementation would use DOMParser or cheerio)
    // Example: <span id="spot-price">85.5</span>
    const spotPriceMatch = html.match(/id="spot-price">([\d.]+)</);
    const spotPrice = spotPriceMatch ? parseFloat(spotPriceMatch[1]) : 0;
    // Add similar parsing for other fields as needed
    // TODO: Implement real parsing logic
    return {
      spotPrice,
      change: 0,
      changePercent: 0,
      lastUpdated: new Date().toISOString(),
      history: [],
    };
  }

  validate(html: unknown): html is string {
    return typeof html === 'string' && html.includes('spot-price');
  }
}
