import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Parse the URL and query params
  const urlObj = new URL(
    `https://www.alphavantage.co${req.url?.replace(/^\/api\/alpha-vantage/, '')}`,
  );
  // If apikey is missing, inject from process.env
  if (!urlObj.searchParams.get('apikey') && process.env.ALPHA_VANTAGE_API_KEY) {
    urlObj.searchParams.set('apikey', process.env.ALPHA_VANTAGE_API_KEY);
  }
  const url = urlObj.toString();
  // Build valid headers for fetch
  const headers: Record<string, string> = {};
  Object.entries(req.headers).forEach(([key, value]) => {
    if (key.toLowerCase() === 'host' || typeof value === 'undefined') return;
    if (Array.isArray(value)) {
      headers[key] = value.join(', ');
    } else {
      headers[key] = value;
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
