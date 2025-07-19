import { BaseDataParser } from '../../../services/dataParser';
import type { TimeTileData } from './types';

// Base parser class with timezone
abstract class BaseTimeDataParser extends BaseDataParser<Record<string, unknown>, TimeTileData> {
  protected abstract timezone: string;

  parse(rawData: Record<string, unknown>): TimeTileData {
    // Convert GitHub rate limit response to timezone data
    const resources = rawData.resources as Record<string, unknown>;
    const core = resources?.core as Record<string, unknown>;
    const resetTime = (core?.reset as number) * 1000; // Convert to milliseconds
    const utcTime = new Date(resetTime);
    
    // Convert to target timezone
    const targetDate = new Date(utcTime.toLocaleString("en-US", {timeZone: this.timezone}));
    
    // Format time as HH:MM:SS
    const timeString = targetDate.toLocaleTimeString('en-US', { 
      timeZone: this.timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Format date as YYYY-MM-DD
    const dateString = targetDate.toLocaleDateString('en-US', { 
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-');
    
    // Calculate timezone offset
    const utcOffset = targetDate.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(utcOffset) / 60);
    const offsetMinutes = Math.abs(utcOffset) % 60;
    const offsetSign = utcOffset <= 0 ? '+' : '-';
    const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    
    // Get day of week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[targetDate.getDay()];
    
    // Get timezone abbreviation
    const abbreviation = targetDate.toLocaleDateString('en-US', { 
      timeZone: this.timezone, 
      timeZoneName: 'short' 
    }).split(', ')[1] || 'UTC';
    
    // Calculate business hours (simplified - assume 9 AM to 5 PM)
    const hour = targetDate.getHours();
    const isBusinessHours = hour >= 9 && hour < 17;
    const businessStatus = isBusinessHours ? 'open' : 'closed';
    
    return {
      currentTime: timeString,
      timezone: this.timezone,
      abbreviation: abbreviation,
      offset: offsetString,
      dayOfWeek: dayOfWeek,
      date: dateString,
      isBusinessHours: isBusinessHours,
      businessStatus: businessStatus,
      lastUpdate: new Date().toISOString()
    };
  }

  validate(rawData: unknown): rawData is Record<string, unknown> {
    if (!rawData || typeof rawData !== 'object') {
      return false;
    }

    const data = rawData as Record<string, unknown>;
    
    // Check if it's GitHub Rate Limit API response
    if ('resources' in data && data.resources && typeof data.resources === 'object') {
      const resources = data.resources as Record<string, unknown>;
      if (resources.core && typeof resources.core === 'object') {
        const core = resources.core as Record<string, unknown>;
        return typeof core.reset === 'number';
      }
    }

    return false;
  }
}

// Helsinki time parser
export class HelsinkiTimeDataParser extends BaseTimeDataParser {
  protected timezone = 'Europe/Helsinki';
}

// Prague time parser
export class PragueTimeDataParser extends BaseTimeDataParser {
  protected timezone = 'Europe/Prague';
}

// Taipei time parser
export class TaipeiTimeDataParser extends BaseTimeDataParser {
  protected timezone = 'Asia/Taipei';
} 
