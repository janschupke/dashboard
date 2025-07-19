import { BaseDataMapper } from '../../../services/dataMapper';
import type { TimeTileData, TimeApiResponse } from './types';
import { DateTime } from 'luxon';

// TimeAPI.io response format
interface TimeApiIoResponse extends Record<string, unknown> {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  seconds: number;
  milliSeconds: number;
  dateTime: string;
  date: string;
  time: string;
  timeZone: string;
  dayOfWeek: string;
  dstActive: boolean;
}

export class TimeDataMapper extends BaseDataMapper<TimeApiResponse | TimeApiIoResponse, TimeTileData> {
  map(apiResponse: TimeApiResponse | TimeApiIoResponse): TimeTileData {
    // Check if it's TimeAPI.io response
    if ('timeZone' in apiResponse && 'dateTime' in apiResponse) {
      return this.mapTimeApiIoResponse(apiResponse as TimeApiIoResponse);
    }
    
    // Handle WorldTimeAPI response
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

  private mapTimeApiIoResponse(apiResponse: TimeApiIoResponse): TimeTileData {
    const dt = DateTime.fromISO(apiResponse.dateTime, { zone: apiResponse.timeZone });
    return {
      currentTime: dt.toFormat('HH:mm:ss'),
      timezone: apiResponse.timeZone,
      abbreviation: apiResponse.dstActive ? 'DST' : 'STD',
      offset: `+${Math.floor(dt.offset / 60).toString().padStart(2, '0')}:${(dt.offset % 60).toString().padStart(2, '0')}`,
      dayOfWeek: apiResponse.dayOfWeek,
      date: dt.toISODate() ?? '',
      isBusinessHours: this.isBusinessHours(dt),
      businessStatus: this.getBusinessStatus(dt),
      lastUpdate: DateTime.now().toISO(),
    };
  }

  validate(apiResponse: unknown): apiResponse is TimeApiResponse | TimeApiIoResponse {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return false;
    }

    const response = apiResponse as Record<string, unknown>;

    // Check if it's TimeAPI.io response
    if ('timeZone' in response && 'dateTime' in response) {
      const requiredTimeApiFields = [
        'year', 'month', 'day', 'hour', 'minute', 'seconds',
        'dateTime', 'date', 'time', 'timeZone', 'dayOfWeek', 'dstActive'
      ];
      
      for (const field of requiredTimeApiFields) {
        if (!(field in response)) {
          return false;
        }
      }
      
      return (
        typeof response.year === 'number' &&
        typeof response.month === 'number' &&
        typeof response.day === 'number' &&
        typeof response.hour === 'number' &&
        typeof response.minute === 'number' &&
        typeof response.seconds === 'number' &&
        typeof response.dateTime === 'string' &&
        typeof response.date === 'string' &&
        typeof response.time === 'string' &&
        typeof response.timeZone === 'string' &&
        typeof response.dayOfWeek === 'string' &&
        typeof response.dstActive === 'boolean'
      );
    }

    // Check for WorldTimeAPI required fields
    const requiredWorldTimeFields = [
      'datetime',
      'timezone',
      'utc_datetime',
      'utc_offset',
      'day_of_week',
      'day_of_year',
      'week_number',
      'abbreviation',
    ];

    for (const field of requiredWorldTimeFields) {
      if (!(field in response)) {
        return false;
      }
    }

    // Validate WorldTimeAPI data types
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
