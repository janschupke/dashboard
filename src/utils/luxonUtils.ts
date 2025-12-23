import { DateTime, Duration } from 'luxon';

/**
 * Luxon utility functions
 * Centralizes datetime operations using Luxon instead of native Date
 */

/**
 * Get current DateTime
 */
export function now(): DateTime {
  return DateTime.now();
}

/**
 * Convert ISO string to DateTime
 */
export function fromISO(iso: string): DateTime {
  return DateTime.fromISO(iso);
}

/**
 * Convert Date to DateTime
 */
export function fromDate(date: Date): DateTime {
  return DateTime.fromJSDate(date);
}

/**
 * Convert Unix timestamp (seconds) to DateTime
 */
export function fromUnixTimestamp(timestamp: number): DateTime {
  return DateTime.fromSeconds(timestamp);
}

/**
 * Convert Unix timestamp (milliseconds) to DateTime
 */
export function fromUnixTimestampMs(timestamp: number): DateTime {
  return DateTime.fromMillis(timestamp);
}

/**
 * Format DateTime to locale string
 */
export function toLocaleString(dt: DateTime, options?: Intl.DateTimeFormatOptions): string {
  return dt.toLocaleString(options);
}

/**
 * Format DateTime to locale date string
 */
export function toLocaleDateString(dt: DateTime): string {
  return dt.toLocaleString({ month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Calculate difference between two DateTimes in minutes
 */
export function diffInMinutes(dt1: DateTime, dt2: DateTime): number {
  return Math.floor(dt2.diff(dt1, 'minutes').minutes);
}

/**
 * Calculate difference between two DateTimes in hours
 */
export function diffInHours(dt1: DateTime, dt2: DateTime): number {
  return Math.floor(dt2.diff(dt1, 'hours').hours);
}

/**
 * Calculate difference between two DateTimes in milliseconds
 */
export function diffInMilliseconds(dt1: DateTime, dt2: DateTime): number {
  return dt2.diff(dt1, 'milliseconds').milliseconds;
}

/**
 * Format relative time (e.g., "5m ago", "2h ago")
 * Note: This function returns raw strings. For i18n support, use formatRelativeTimeI18n instead
 */
export function formatRelativeTime(dt: DateTime, reference: DateTime = now()): string {
  const diffMs = diffInMilliseconds(dt, reference);
  const diffMins = Math.floor(Math.abs(diffMs) / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return toLocaleDateString(dt);
}

/**
 * Create a Duration from milliseconds
 */
export function durationFromMs(ms: number): Duration {
  return Duration.fromMillis(ms);
}

/**
 * Create a Duration from seconds
 */
export function durationFromSeconds(seconds: number): Duration {
  return Duration.fromObject({ seconds });
}

/**
 * Create a Duration from minutes
 */
export function durationFromMinutes(minutes: number): Duration {
  return Duration.fromObject({ minutes });
}

