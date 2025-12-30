import { DateTime } from 'luxon';

import { formatRelativeTime, fromISO, toLocaleString } from '../../utils/luxonUtils';

import { TileStatus } from './useTileData';

export interface StatusIcon {
  name: string;
  className: string;
}

/**
 * Get status icon configuration based on tile status
 */
export function getStatusIcon(status?: TileStatus): StatusIcon | null {
  switch (status) {
    case TileStatus.Loading:
      return null; // No icon for loading state
    case TileStatus.Stale:
      return { name: 'warning', className: 'text-status-warning' };
    case TileStatus.Success:
      return { name: 'success', className: 'text-status-success' };
    case TileStatus.Error:
      return { name: 'close', className: 'text-status-error' };
    case undefined:
    default:
      return null;
  }
}

/**
 * Get status tooltip text for status icon
 */
export function getStatusTooltipText(status?: TileStatus): string {
  switch (status) {
    case TileStatus.Loading:
      return 'Loading data...';
    case TileStatus.Success:
      return 'Data is up to date';
    case TileStatus.Error:
      return 'Data fetch failed';
    case TileStatus.Stale:
      return 'Data is stale';
    case undefined:
    default:
      return '';
  }
}

/**
 * Format last update time using relative time
 */
export function formatLastUpdate(
  isLoading: boolean | undefined,
  timestamp: string | undefined,
  currentTime: DateTime,
  t: (key: string) => string,
): string {
  if (isLoading) return t('tile.pending');
  if (!timestamp) return t('tile.never');
  try {
    const date = fromISO(timestamp);
    if (!date.isValid) return t('tile.invalidDate');
    return formatRelativeTime(date, currentTime);
  } catch {
    return t('tile.invalidDate');
  }
}

/**
 * Format full datetime for tooltip display
 */
function formatFullDateTime(timestamp: string | undefined, t: (key: string) => string): string {
  if (!timestamp) return t('tile.never');
  try {
    const date = fromISO(timestamp);
    if (!date.isValid) return t('tile.invalidDate');
    return toLocaleString(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return t('tile.invalidDate');
  }
}

/**
 * Get last request tooltip content (simple for success and error, enhanced for stale)
 */
export function getLastRequestTooltipContent(
  status: TileStatus | undefined,
  lastUpdate: string | undefined,
  t: (key: string) => string,
): string | undefined {
  if (status === TileStatus.Success || status === TileStatus.Error) {
    // Simple tooltip with just the time
    return formatFullDateTime(lastUpdate, t);
  }
  // For stale, show both timestamps (use HTML version)
  return undefined;
}

/**
 * Get last request tooltip HTML (for stale with multi-line content)
 */
export function getLastRequestTooltipHtml(
  status: TileStatus | undefined,
  lastUpdate: string | undefined,
  lastSuccessfulDataUpdate: string | undefined,
  t: (key: string) => string,
): string | undefined {
  if (status === TileStatus.Stale) {
    const lastRequestTime = formatFullDateTime(lastUpdate, t);
    // Stale: use the actual last successful data timestamp
    const lastDataTime = formatFullDateTime(lastSuccessfulDataUpdate, t);
    return `Last request: ${lastRequestTime}<br />Last data: ${lastDataTime}`;
  }
  return undefined;
}

/**
 * Get card variant based on tile status
 */
export function getCardVariant(status?: TileStatus): 'default' | 'elevated' | 'outlined' {
  if (status === TileStatus.Error || status === TileStatus.Stale) {
    return 'outlined';
  }
  return 'elevated';
}

/**
 * Get border class based on tile status
 */
export function getBorderClass(status?: TileStatus): string {
  if (status === TileStatus.Error) {
    return 'border-status-error';
  }
  if (status === TileStatus.Stale) {
    return 'border-status-warning';
  }
  return '';
}
