import { DateTime } from 'luxon';

import { BaseDataParser } from '../../../services/dataParser';

import type { UraniumTileData } from './types';

/**
 * Parses Trading Economics HTML to UraniumTileData for the tile.
 * Uses DOMParser for reliable client-side HTML parsing.
 */
export class UraniumHtmlDataParser extends BaseDataParser<string, UraniumTileData> {
  private static readonly PRICE_SELECTORS = [
    '#p', // Trading Economics uses <td id="p">81.95</td>
    '#spot-price',
    '[data-price]',
    '[id*="price"]',
    '[class*="price"]',
    'td[id="p"]',
    'span[class*="price"]',
    'td[class*="price"]',
  ] as const;

  private static readonly PRICE_PATTERNS = [
    /(\d+\.?\d*)\s*USD\/Lbs?/i, // Trading Economics uses "USD/Lbs"
    /(\d+\.?\d*)\s*USD\/lb/i,
    /\$(\d+\.?\d*)/,
    /price[:\s]*(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*(?:USD|dollars?)/i,
    /rose to (\d+\.?\d*)\s*USD/i, // "Uranium rose to 81.95 USD/Lbs"
  ] as const;

  private static readonly CHANGE_SELECTORS = [
    '[class*="change"]',
    '[id*="change"]',
    '[data-change]',
  ] as const;

  private static readonly MIN_PRICE = 0;
  private static readonly MAX_PRICE = 10000;

  /**
   * Extracts price from a DOM element, trying data attribute first, then text content.
   */
  private extractPriceFromElement(element: Element): number | null {
    // Try data-price attribute first
    const dataPrice = element.getAttribute('data-price');
    if (dataPrice) {
      const parsed = parseFloat(dataPrice);
      if (this.isValidPrice(parsed)) {
        return parsed;
      }
    }

    // Try to extract from text content
    const text = element.textContent ?? '';
    const priceMatch = text.match(/(\d+\.?\d*)/);
    if (priceMatch?.[1]) {
      const parsed = parseFloat(priceMatch[1]);
      if (this.isValidPrice(parsed)) {
        return parsed;
      }
    }

    return null;
  }

  /**
   * Validates if a number is a reasonable price value.
   */
  private isValidPrice(price: number): boolean {
    return (
      !isNaN(price) &&
      price > UraniumHtmlDataParser.MIN_PRICE &&
      price < UraniumHtmlDataParser.MAX_PRICE
    );
  }

  /**
   * Tries to extract price from meta description or JavaScript variables.
   */
  private findPriceInMetadata(doc: Document, html: string): number | null {
    // Try meta description first (e.g., "Uranium rose to 81.95 USD/Lbs")
    const metaDesc = doc.querySelector('meta[name="description"]');
    if (metaDesc) {
      const content = metaDesc.getAttribute('content') ?? '';
      // Try multiple patterns for meta description
      const metaPatterns = [
        /rose to (\d+\.?\d*)\s*USD\/Lbs?/i, // "Uranium rose to 81.95 USD/Lbs"
        /(\d+\.?\d*)\s*USD\/Lbs?/i, // General "81.95 USD/Lbs"
        /(\d+\.?\d*)\s*USD\/lb/i, // "81.95 USD/lb"
      ];

      for (const pattern of metaPatterns) {
        const priceMatch = content.match(pattern);
        if (priceMatch?.[1]) {
          const parsed = parseFloat(priceMatch[1]);
          if (this.isValidPrice(parsed)) {
            return parsed;
          }
        }
      }
    }

    // Try to find price in JavaScript variables (TEChartsMeta)
    // Pattern: TEChartsMeta = [{"value":81.95,"last":81.95,...}]
    // Use a more flexible regex that handles the full JSON structure
    const jsPatterns = [
      /TEChartsMeta\s*=\s*\[[^\]]*"last"\s*:\s*(\d+\.?\d*)/,
      /TEChartsMeta\s*=\s*\[[^\]]*"value"\s*:\s*(\d+\.?\d*)/,
      /"last"\s*:\s*(\d+\.?\d*)/, // Simple "last":81.95 anywhere
      /"value"\s*:\s*(\d+\.?\d*)/, // Simple "value":81.95 anywhere
    ];

    for (const pattern of jsPatterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const parsed = parseFloat(match[1]);
        if (this.isValidPrice(parsed)) {
          return parsed;
        }
      }
    }

    return null;
  }

  /**
   * Tries to find spot price using CSS selectors.
   */
  private findPriceBySelectors(doc: Document): number | null {
    for (const selector of UraniumHtmlDataParser.PRICE_SELECTORS) {
      try {
        const element = doc.querySelector(selector);
        if (element) {
          const price = this.extractPriceFromElement(element);
          if (price !== null) {
            return price;
          }
        }
      } catch {
        // Invalid selector, continue to next
        continue;
      }
    }
    return null;
  }

  /**
   * Tries to find spot price by searching text patterns in the document.
   */
  private findPriceByPatterns(doc: Document, html: string): number | null {
    // Search in body text first
    const allText = doc.body?.textContent ?? '';

    for (const pattern of UraniumHtmlDataParser.PRICE_PATTERNS) {
      const match = allText.match(pattern);
      if (match?.[1]) {
        const parsed = parseFloat(match[1]);
        if (this.isValidPrice(parsed)) {
          return parsed;
        }
      }
    }

    // Also search in full HTML (for script tags, etc.)
    for (const pattern of UraniumHtmlDataParser.PRICE_PATTERNS) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const parsed = parseFloat(match[1]);
        if (this.isValidPrice(parsed)) {
          return parsed;
        }
      }
    }

    return null;
  }

  /**
   * Extracts the spot price from the HTML document.
   */
  private extractSpotPrice(doc: Document, html: string): number {
    // Try metadata/JavaScript variables first (most reliable for Trading Economics)
    const priceFromMetadata = this.findPriceInMetadata(doc, html);
    if (priceFromMetadata !== null) {
      return priceFromMetadata;
    }

    // Try #p selector if it exists (Trading Economics specific: <td id="p">81.95</td>)
    const priceElement = doc.querySelector('#p');
    if (priceElement) {
      const text = priceElement.textContent?.trim() ?? '';
      const priceMatch = text.match(/(\d+\.?\d*)/);
      if (priceMatch?.[1]) {
        const parsed = parseFloat(priceMatch[1]);
        if (this.isValidPrice(parsed)) {
          return parsed;
        }
      }
    }

    // Try other selectors
    const priceFromSelectors = this.findPriceBySelectors(doc);
    if (priceFromSelectors !== null) {
      return priceFromSelectors;
    }

    // Fallback to pattern matching
    const priceFromPatterns = this.findPriceByPatterns(doc, html);
    if (priceFromPatterns !== null) {
      return priceFromPatterns;
    }

    throw new Error('Could not extract uranium spot price from HTML');
  }

  /**
   * Extracts change and change percentage from the HTML document.
   */
  private extractChangeValues(doc: Document): { change: number; changePercent: number } {
    let change = 0;
    let changePercent = 0;

    // Try meta description first (e.g., "up 0.68% from the previous day")
    const metaDesc = doc.querySelector('meta[name="description"]');
    if (metaDesc) {
      const content = metaDesc.getAttribute('content') ?? '';
      // Match "up 0.68%" or "down 0.68%" patterns
      const percentMatch = content.match(/(?:up|down)\s+(\d+\.?\d*)\s*%/i);
      if (percentMatch?.[1]) {
        const parsed = parseFloat(percentMatch[1]);
        if (!isNaN(parsed)) {
          // Check if it's "up" (positive) or "down" (negative)
          const isUp = /up\s+\d+\.?\d*\s*%/i.test(content);
          changePercent = isUp ? parsed : -parsed;
        }
      }
    }

    // Try CSS selectors
    for (const selector of UraniumHtmlDataParser.CHANGE_SELECTORS) {
      try {
        const element = doc.querySelector(selector);
        if (!element) {
          continue;
        }

        const text = element.textContent ?? '';
        const changeMatch = text.match(/([+-]?\d+\.?\d*)\s*%?/);
        if (!changeMatch?.[1]) {
          continue;
        }

        const parsed = parseFloat(changeMatch[1]);
        if (isNaN(parsed)) {
          continue;
        }

        // Determine if it's a percentage or absolute change
        if (text.includes('%')) {
          if (changePercent === 0) {
            changePercent = parsed;
          }
        } else {
          if (change === 0) {
            change = parsed;
          }
        }

        // If we found both, we can stop
        if (change !== 0 && changePercent !== 0) {
          break;
        }
      } catch {
        continue;
      }
    }

    return { change, changePercent };
  }

  parse(html: string): UraniumTileData {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const spotPrice = this.extractSpotPrice(doc, html);
    const { change, changePercent } = this.extractChangeValues(doc);

    return {
      spotPrice,
      change,
      changePercent,
      lastUpdated: DateTime.now().toISO() ?? '',
      history: [], // History would need to be parsed from chart data or separate endpoint
    };
  }

  /**
   * Checks if HTML string contains price-related content.
   */
  private hasPriceContent(text: string): boolean {
    // Check for various price indicators - be very lenient
    return (
      /[\d.]+.*(?:price|USD|lb|dollar|Lbs)/i.test(text) ||
      /"last"\s*:\s*[\d.]+/i.test(text) ||
      /"value"\s*:\s*[\d.]+/i.test(text) ||
      /TEChartsMeta/i.test(text) ||
      /uranium.*USD/i.test(text) ||
      /USD\/Lbs?/i.test(text) ||
      /rose to.*USD/i.test(text) ||
      (/\d+\.?\d*/.test(text) && /uranium/i.test(text)) // Any number + "uranium"
    );
  }

  /**
   * Checks if HTML string appears to be an error page.
   */
  private isErrorPage(text: string): boolean {
    return /error|404|not found|page not found/i.test(text);
  }

  /**
   * Validates HTML using DOMParser.
   */
  private validateWithDOMParser(html: string): boolean {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Check for parse errors (but be lenient - some HTML might have minor issues)
      const parseError = doc.querySelector('parsererror');
      if (parseError && html.length < 500) {
        // Only fail on parse errors if HTML is very short (likely actually broken)
        return false;
      }

      // Check full HTML string (includes meta tags, script tags) and body text
      const bodyText = doc.body?.textContent ?? '';
      const fullText = html; // Check full HTML for meta tags and scripts

      // Check if it's an error page first
      if (this.isErrorPage(bodyText) || this.isErrorPage(fullText)) {
        return false;
      }

      // Check for price content in both body and full HTML (meta tags, scripts)
      const hasPriceInBody = this.hasPriceContent(bodyText);
      const hasPriceInFull = this.hasPriceContent(fullText);

      // Be very lenient - if HTML is long enough and has uranium-related content, accept it
      const hasUraniumContent = /uranium/i.test(fullText) || /uranium/i.test(bodyText);
      const hasNumbers = /\d+\.?\d*/.test(fullText);

      return (
        ((hasPriceInBody || hasPriceInFull) && html.length > 100) ||
        (hasUraniumContent && hasNumbers && html.length > 500)
      );
    } catch {
      // If parsing completely fails, fall back to string check
      return this.validateWithStringCheck(html);
    }
  }

  /**
   * Fallback validation using basic string checks.
   */
  private validateWithStringCheck(html: string): boolean {
    const hasPrice = this.hasPriceContent(html);
    const isError = this.isErrorPage(html);
    return hasPrice && !isError && html.length > 100;
  }

  validate(html: unknown): html is string {
    if (typeof html !== 'string') {
      return false;
    }

    // Basic sanity checks first
    if (html.length < 50) {
      return false;
    }

    // Check if it's clearly an error page
    if (this.isErrorPage(html)) {
      return false;
    }

    // Very lenient check: if it has "uranium" and looks like HTML, accept it
    const hasUranium = /uranium/i.test(html);
    const looksLikeHtml = /<html|<head|<body|<!doctype/i.test(html);
    const hasNumbers = /\d+\.?\d*/.test(html);

    if (hasUranium && looksLikeHtml && hasNumbers && html.length > 200) {
      return true;
    }

    // Try DOMParser validation
    const domValidation = this.validateWithDOMParser(html);
    if (domValidation) {
      return true;
    }

    // Fallback to string-based validation (most lenient)
    return this.validateWithStringCheck(html);
  }
}
