/**
 * Application enums
 * Centralizes enum-like constants to avoid magic strings
 */

/**
 * Trading status values
 */
export const TradingStatus = {
  OPEN: 'open',
  CLOSED: 'closed',
  PRE_MARKET: 'pre-market',
  AFTER_HOURS: 'after-hours',
} as const;

export type TradingStatus = (typeof TradingStatus)[keyof typeof TradingStatus];
