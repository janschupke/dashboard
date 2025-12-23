import { TIME_CONSTANTS } from '../contexts/constants';

/**
 * Time utility functions
 * Centralizes time calculations to avoid magic numbers and duplication
 *
 * Note: For datetime operations, use luxonUtils.ts instead
 */

/**
 * Converts seconds to milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * TIME_CONSTANTS.MILLISECONDS_PER_SECOND;
}

/**
 * Converts minutes to milliseconds
 */
export function minutesToMs(minutes: number): number {
  return minutes * TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MILLISECONDS_PER_SECOND;
}

/**
 * Converts hours to milliseconds
 */
export function hoursToMs(hours: number): number {
  return (
    hours *
    TIME_CONSTANTS.MINUTES_PER_HOUR *
    TIME_CONSTANTS.SECONDS_PER_MINUTE *
    TIME_CONSTANTS.MILLISECONDS_PER_SECOND
  );
}

/**
 * Converts milliseconds to seconds
 */
export function msToSeconds(ms: number): number {
  return ms / TIME_CONSTANTS.MILLISECONDS_PER_SECOND;
}

/**
 * Converts milliseconds to minutes
 */
export function msToMinutes(ms: number): number {
  return ms / (TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MILLISECONDS_PER_SECOND);
}

/**
 * Converts milliseconds to hours
 */
export function msToHours(ms: number): number {
  return (
    ms /
    (TIME_CONSTANTS.MINUTES_PER_HOUR *
      TIME_CONSTANTS.SECONDS_PER_MINUTE *
      TIME_CONSTANTS.MILLISECONDS_PER_SECOND)
  );
}
