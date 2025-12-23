import { DateTime } from 'luxon';

/**
 * Date formatting utilities
 * Centralizes date formatting logic to avoid duplication
 */

/**
 * Format a Date object to ISO string using Luxon
 */
export function formatDateToISO(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return DateTime.fromJSDate(date).toISO() ?? undefined;
}

/**
 * Format a DateTime to ISO string
 */
export function formatDateTimeToISO(dateTime: DateTime | null | undefined): string | undefined {
  if (!dateTime?.isValid) return undefined;
  return dateTime.toISO() ?? undefined;
}
