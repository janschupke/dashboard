import { describe, it, expect } from 'vitest';

import { UraniumHtmlDataParser } from './dataParser';

describe('UraniumHtmlDataParser', () => {
  const parser = new UraniumHtmlDataParser();

  describe('validate', () => {
    it('should validate HTML with uranium price content', () => {
      // Parser requires HTML to be >200 chars and have uranium + numbers
      const validHtml =
        '<html><head><meta name="description" content="Uranium rose to 85.5 USD/Lbs" /></head><body><span id="spot-price">85.5</span><td id="p">85.5</td><div>Uranium price information and market data for trading economics and financial analysis purposes.</div></body></html>';
      expect(parser.validate(validHtml)).toBe(true);
    });

    it('should reject non-string input', () => {
      expect(parser.validate(null)).toBe(false);
      expect(parser.validate(undefined)).toBe(false);
      expect(parser.validate(123)).toBe(false);
      expect(parser.validate({})).toBe(false);
    });

    it('should reject HTML that is too short', () => {
      expect(parser.validate('<html></html>')).toBe(false);
      expect(parser.validate('short')).toBe(false);
    });

    it('should reject error pages', () => {
      expect(parser.validate('<html><body>404 Not Found</body></html>')).toBe(false);
      expect(parser.validate('<html><body>Error page</body></html>')).toBe(false);
    });

    it('should accept HTML with uranium and price content', () => {
      const htmlWithUranium =
        '<html><head><meta name="description" content="Uranium rose to 85.5 USD/Lbs" /></head><body>Uranium price is 85.5</body></html>';
      expect(parser.validate(htmlWithUranium)).toBe(true);
    });
  });

  describe('parse', () => {
    it('should parse HTML with spot-price id', () => {
      const html = '<html><body><span id="spot-price">85.5</span></body></html>';
      const result = parser.parse(html);

      expect(result).toHaveProperty('spotPrice');
      expect(result).toHaveProperty('change');
      expect(result).toHaveProperty('changePercent');
      expect(result).toHaveProperty('lastUpdated');
      expect(result).toHaveProperty('history');
      expect(result.spotPrice).toBe(85.5);
      expect(typeof result.change).toBe('number');
      expect(typeof result.changePercent).toBe('number');
      expect(typeof result.lastUpdated).toBe('string');
      expect(Array.isArray(result.history)).toBe(true);
    });

    it('should parse HTML with #p selector (Trading Economics format)', () => {
      // Need enough content for validation to pass - include uranium keyword and sufficient length
      const html =
        '<html><head><meta name="description" content="Uranium price 81.95 USD/Lbs" /></head><body><table><tr><td id="p">81.95</td></tr></table><div>Uranium market data and trading information for financial analysis purposes with additional content to meet length requirements.</div></body></html>';
      const result = parser.parse(html);

      expect(result.spotPrice).toBe(81.95);
    });

    it('should extract price from meta description', () => {
      const html =
        '<html><head><meta name="description" content="Uranium rose to 85.5 USD/Lbs" /></head><body></body></html>';
      const result = parser.parse(html);

      expect(result.spotPrice).toBe(85.5);
    });

    it('should extract change percentage from meta description', () => {
      const html =
        '<html><head><meta name="description" content="Uranium rose to 85.5 USD/Lbs, up 0.68% from the previous day" /></head><body></body></html>';
      const result = parser.parse(html);

      expect(result.spotPrice).toBe(85.5);
      expect(result.changePercent).toBeGreaterThan(0);
    });

    it('should handle HTML with data-price attribute', () => {
      const html = '<html><body><div data-price="85.5">Uranium</div></body></html>';
      const result = parser.parse(html);

      expect(result.spotPrice).toBe(85.5);
    });

    it('should throw error when price cannot be extracted', () => {
      const htmlWithoutPrice = '<html><body><div>No price here</div></body></html>';

      expect(() => parser.parse(htmlWithoutPrice)).toThrow(
        'Could not extract uranium spot price from HTML',
      );
    });
  });

  describe('safeParse', () => {
    it('should successfully parse valid HTML', () => {
      // Need enough content for validation to pass
      const html =
        '<html><head><meta name="description" content="Uranium rose to 85.5 USD/Lbs" /></head><body><span id="spot-price">85.5</span><div>Uranium market information</div></body></html>';
      const result = parser.safeParse(html);

      expect(result.spotPrice).toBe(85.5);
    });

    it('should throw error for invalid HTML', () => {
      expect(() => parser.safeParse(null)).toThrow('Invalid raw data format');
      expect(() => parser.safeParse('short')).toThrow('Invalid raw data format');
    });

    it('should throw error when parsing fails', () => {
      // HTML that passes validation (has uranium + numbers + HTML structure) but parse() fails
      // because extractSpotPrice can't find a valid price in the expected format
      // The number 50000 is outside the valid price range (0-10000), so it won't be extracted
      const htmlWithoutPrice =
        '<html><head><meta name="description" content="Uranium information 50000" /></head><body><div>Uranium market data with large numbers. Some additional content here to ensure the HTML is long enough to pass validation checks and contains uranium keyword as required for proper validation.</div></body></html>';
      // This should pass validation but fail during parse() when extractSpotPrice throws
      // because 50000 is outside the valid price range (0-10000)
      expect(() => parser.safeParse(htmlWithoutPrice)).toThrow('Data parsing failed');
    });
  });
});
