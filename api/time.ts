import type { VercelRequest, VercelResponse } from '@vercel/node';

// Convert UTC time to specific timezone and format as WorldTimeAPI response
function convertToTimezone(utcTime: Date, timezone: string) {
  try {
    // Create a date in the target timezone
    const targetDate = new Date(utcTime.toLocaleString("en-US", {timeZone: timezone}));
    
    // Calculate timezone offset
    const utcOffset = targetDate.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(utcOffset) / 60);
    const offsetMinutes = Math.abs(utcOffset) % 60;
    const offsetSign = utcOffset <= 0 ? '+' : '-';
    const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    
    // Calculate day of year
    const startOfYear = new Date(targetDate.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((targetDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate week number
    const firstDayOfYear = new Date(targetDate.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((dayOfYear + firstDayOfYear.getDay()) / 7);
    
    return {
      datetime: targetDate.toISOString(),
      timezone: timezone,
      utc_datetime: utcTime.toISOString(),
      utc_offset: offsetString,
      day_of_week: targetDate.getDay(),
      day_of_year: dayOfYear,
      week_number: weekNumber,
      abbreviation: targetDate.toLocaleDateString('en-US', { timeZone: timezone, timeZoneName: 'short' }).split(', ')[1] || 'UTC',
      client_ip: '127.0.0.1'
    };
  } catch (error) {
    console.error('Timezone conversion error:', error);
    // Fallback to UTC
    return {
      datetime: utcTime.toISOString(),
      timezone: 'UTC',
      utc_datetime: utcTime.toISOString(),
      utc_offset: '+00:00',
      day_of_week: utcTime.getDay(),
      day_of_year: Math.floor((utcTime.getTime() - new Date(utcTime.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)),
      week_number: Math.ceil((utcTime.getDate() + new Date(utcTime.getFullYear(), 0, 1).getDay()) / 7),
      abbreviation: 'UTC',
      client_ip: '127.0.0.1'
    };
  }
}

// Get current UTC time from GitHub's rate limit API (fast and reliable)
async function getCurrentUTCTime(): Promise<Date> {
  try {
    const response = await fetch('https://api.github.com/rate_limit', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Dashboard/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const resetTime = data.resources.core.reset * 1000; // Convert to milliseconds
      return new Date(resetTime);
    }
  } catch (error) {
    console.error('GitHub API failed:', error);
  }
  
  // Fallback to server time
  return new Date();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url?.replace(/^\/api\/time/, '') || '';
  
  // Handle timezone requests
  if (path.startsWith('/api/timezone/')) {
    const timezone = path.replace('/api/timezone/', '');
    
    try {
      // Get current UTC time from GitHub's fast API
      const utcTime = await getCurrentUTCTime();
      
      // Convert to target timezone
      const convertedData = convertToTimezone(utcTime, timezone);
      
      res.status(200);
      res.setHeader('Content-Type', 'application/json');
      res.json(convertedData);
      return;
    } catch (error) {
      console.error('Time API failed:', error);
      res.status(500);
      res.json({ error: 'Time API is currently unavailable' });
      return;
    }
  }
  
  // Handle other requests with error (not supported)
  res.status(404);
  res.json({ error: 'Endpoint not supported' });
}
