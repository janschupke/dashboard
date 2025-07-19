import { BaseDataMapper } from '../../../services/dataMapper';
import type { TimeTileData, TimeApiResponse } from './types';
import { DateTime } from 'luxon';

export class TimeDataMapper extends BaseDataMapper<TimeApiResponse, TimeTileData> {
  map(apiResponse: TimeApiResponse): TimeTileData {
    const dt = DateTime.fromISO(apiResponse.datetime, { zone: apiResponse.timezone });
    return {
      currentTime: dt.toFormat('HH:mm:ss'),
      timezone: apiResponse.timezone,
      abbreviation: apiResponse.abbreviation,
      offset: apiResponse.utc_offset,
      dayOfWeek: dt.weekdayLong ?? '',
      date: dt.toISODate() ?? '',
      isBusinessHours: this.isBusinessHours(dt),
      businessStatus: this.getBusinessStatus(dt),
      lastUpdate: DateTime.now().toISO(),
    };
  }

  validate(apiResponse: unknown): apiResponse is TimeApiResponse {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return false;
    }

    const response = apiResponse as Record<string, unknown>;

    // Check for required fields
    const requiredFields = [
      'datetime',
      'timezone',
      'utc_datetime',
      'utc_offset',
      'day_of_week',
      'day_of_year',
      'week_number',
      'abbreviation',
    ];

    for (const field of requiredFields) {
      if (!(field in response)) {
        return false;
      }
    }

    // Validate data types
    return (
      typeof response.datetime === 'string' &&
      typeof response.timezone === 'string' &&
      typeof response.utc_datetime === 'string' &&
      typeof response.utc_offset === 'string' &&
      typeof response.day_of_week === 'number' &&
      typeof response.day_of_year === 'number' &&
      typeof response.week_number === 'number' &&
      typeof response.abbreviation === 'string'
    );
  }

  private isBusinessHours(dt: DateTime): boolean {
    const hour = dt.hour;
    return hour >= 9 && hour < 17; // 9 AM to 5 PM
  }

  private getBusinessStatus(dt: DateTime): 'open' | 'closed' | 'opening soon' | 'closing soon' {
    const hour = dt.hour;
    const minute = dt.minute;

    if (hour >= 9 && hour < 17) {
      if (hour === 16 && minute >= 45) {
        return 'closing soon';
      }
      return 'open';
    } else if (hour === 8 && minute >= 45) {
      return 'opening soon';
    } else {
      return 'closed';
    }
  }
}
