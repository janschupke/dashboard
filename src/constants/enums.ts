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

/**
 * Card variant types
 */
export const CardVariant = {
  ELEVATED: 'elevated',
  OUTLINED: 'outlined',
  FLAT: 'flat',
} as const;

export type CardVariant = (typeof CardVariant)[keyof typeof CardVariant];

/**
 * Tile status types (matches TileStatus from useTileData)
 */
export const TileStatusType = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  STALE: 'stale',
} as const;

export type TileStatusType = (typeof TileStatusType)[keyof typeof TileStatusType];

/**
 * Toast types
 */
export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type ToastType = (typeof ToastType)[keyof typeof ToastType];

