import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = `https://api.openweathermap.org${req.url?.replace(/^\/api\/openweathermap/, '')}`;
  const apiRes = await fetch(url, {
    method: req.method,
    headers: { ...req.headers, host: undefined },
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });
  const data = await apiRes.arrayBuffer();
  res.status(apiRes.status);
  apiRes.headers.forEach((value, key) => res.setHeader(key, value));
  res.send(Buffer.from(data));
}
