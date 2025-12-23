import { DateTime } from 'luxon';

import { BaseDataMapper } from '../../../services/dataMapper';
import { hoursToMs, msToHours, msToMinutes, secondsToMs } from '../../../utils/timeUtils';

import type { TimeTileData, TimeApiResponse } from './types';

export class TimeDataMapper extends BaseDataMapper<TimeApiResponse, TimeTileData> {
  map(apiResponse: TimeApiResponse): TimeTileData {
    if (!apiResponse || typeof apiResponse.formatted !== 'string' || !apiResponse.zoneName) {
      throw new Error('Invalid time API response: missing formatted or zoneName');
    }
    const dt = DateTime.fromFormat(apiResponse.formatted, 'yyyy-MM-dd HH:mm:ss', {
      zone: apiResponse.zoneName,
    });
    if (!dt.isValid) {
      throw new Error('Invalid time API response: formatted date is invalid');
    }
    return {
      currentTime: dt.toFormat('HH:mm:ss'),
      date: dt.toISODate() ?? '',
      timezone: apiResponse.zoneName,
      abbreviation: apiResponse.abbreviation,
      offset: this.formatOffset(apiResponse.gmtOffset),
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
    return (
      typeof response['status'] === 'string' &&
      typeof response['zoneName'] === 'string' &&
      typeof response['abbreviation'] === 'string' &&
      typeof response['gmtOffset'] === 'number' &&
      typeof response['timestamp'] === 'number' &&
      typeof response['formatted'] === 'string'
    );
  }

  private formatOffset(offsetSeconds: number): string {
    const sign = offsetSeconds >= 0 ? '+' : '-';
    const abs = Math.abs(offsetSeconds);
    const absMs = secondsToMs(abs);
    const hours = Math.floor(msToHours(absMs));
    const minutes = Math.floor(msToMinutes(absMs % hoursToMs(1)));
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
