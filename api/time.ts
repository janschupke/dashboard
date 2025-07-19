import type { VercelRequest, VercelResponse } from '@vercel/node';

// Convert TimeAPI.io response to WorldTimeAPI format for compatibility
function convertTimeApiResponse(timeApiData: Record<string, unknown>) {
  const dateTime = new Date(timeApiData.dateTime as string);
  return {
    datetime: dateTime.toISOString(),
    timezone: timeApiData.timeZone,
    utc_datetime: new Date(dateTime.getTime() - (dateTime.getTimezoneOffset() * 60000)).toISOString(),
    utc_offset: `+${Math.floor(dateTime.getTimezoneOffset() / -60).toString().padStart(2, '0')}:${(dateTime.getTimezoneOffset() % 60).toString().padStart(2, '0')}`,
    day_of_week: dateTime.getDay(),
    day_of_year: Math.floor((dateTime.getTime() - new Date(dateTime.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)),
    week_number: Math.ceil((dateTime.getDate() + new Date(dateTime.getFullYear(), 0, 1).getDay()) / 7),
    abbreviation: timeApiData.dstActive ? 'DST' : 'STD',
    client_ip: '127.0.0.1'
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url?.replace(/^\/api\/time/, '') || '';
  
  // Handle timezone requests
  if (path.startsWith('/api/timezone/')) {
    const timezone = path.replace('/api/timezone/', '');
    
    try {
      // Use TimeAPI.io as the primary and only time API
      const timeApiUrl = `https://timeapi.io/api/Time/current/zone?timeZone=${encodeURIComponent(timezone)}`;
      const timeApiRes = await fetch(timeApiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Dashboard/1.0'
        }
      });
      
      if (timeApiRes.ok) {
        const timeApiData = await timeApiRes.json();
        const convertedData = convertTimeApiResponse(timeApiData);
        
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.json(convertedData);
        return;
      }
    } catch (error) {
      console.error('TimeAPI.io failed:', error);
    }
    
    // Return error if API fails
    res.status(500);
    res.json({ error: 'TimeAPI.io is currently unavailable' });
    return;
  }
  
  // Handle other requests with error (not supported)
  res.status(404);
  res.json({ error: 'Endpoint not supported' });
}
