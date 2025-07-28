import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Parse the URL and query params
  const urlObj = new URL(`https://api.timezonedb.com${req.url?.replace(/^\/api\/timezonedb/, '')}`);

  // If key is missing, inject from process.env
  if (!urlObj.searchParams.get('key') && process.env.TIMEZONEDB_API_KEY) {
    urlObj.searchParams.set('key', process.env.TIMEZONEDB_API_KEY);
  }

  const url = urlObj.toString();

  // Create headers object, filtering out problematic headers
  const headers: Record<string, string> = {};
  Object.entries(req.headers).forEach(([key, value]) => {
    if (key.toLowerCase() !== 'host' && value !== undefined) {
      headers[key] = Array.isArray(value) ? value[0] : value;
    }
  });

  const apiRes = await fetch(url, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });
  const data = await apiRes.arrayBuffer();
  res.status(apiRes.status);
  apiRes.headers.forEach((value, key) => res.setHeader(key, value));
  res.send(Buffer.from(data));
}
