const handler = async (req, res) => {
  // Parse the URL and query params
  const urlObj = new URL(`https://api.stlouisfed.org${req.url?.replace(/^\/api\/fred/, '')}`);

  // If api_key is missing, inject from process.env
  if (!urlObj.searchParams.get('api_key') && process.env.FRED_API_KEY) {
    urlObj.searchParams.set('api_key', process.env.FRED_API_KEY);
  }

  const url = urlObj.toString();

  // Create headers object, filtering out problematic headers
  const headers = {};
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
};

module.exports = handler;
