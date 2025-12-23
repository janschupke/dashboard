/**
 * API field name constants
 * Centralizes API response field names to avoid hardcoded strings
 */

/**
 * Alpha Vantage Global Quote API field names
 * These are the exact field names returned by Alpha Vantage's GLOBAL_QUOTE endpoint
 */
export const ALPHA_VANTAGE_FIELDS = {
  GLOBAL_QUOTE: 'Global Quote',
  SYMBOL: '01. symbol',
  OPEN: '02. open',
  HIGH: '03. high',
  LOW: '04. low',
  PRICE: '05. price',
  VOLUME: '06. volume',
  LATEST_TRADING_DAY: '07. latest trading day',
  PREVIOUS_CLOSE: '08. previous close',
  CHANGE: '09. change',
  CHANGE_PERCENT: '10. change percent',
  // Error fields
  INFORMATION: 'Information',
  ERROR_MESSAGE: 'Error Message',
  NOTE: 'Note',
} as const;

/**
 * Alpha Vantage error field names that indicate API errors
 */
export const ALPHA_VANTAGE_ERROR_FIELDS = [
  ALPHA_VANTAGE_FIELDS.INFORMATION,
  ALPHA_VANTAGE_FIELDS.ERROR_MESSAGE,
  ALPHA_VANTAGE_FIELDS.NOTE,
] as const;
