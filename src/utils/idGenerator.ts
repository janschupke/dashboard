import { DateTime } from 'luxon';

/**
 * ID generation utilities
 * Centralizes ID generation logic to avoid duplication
 */

/**
 * Generate a unique ID using timestamp and random string
 */
export function generateId(prefix = ''): string {
  const timestamp = DateTime.now().toMillis();
  const random = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Generate a tile ID
 */
export function generateTileId(): string {
  return generateId('tile');
}

/**
 * Generate a log entry ID
 */
export function generateLogId(): string {
  return generateId('log');
}

