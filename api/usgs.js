const handler = async (req, res) => {
  const url = `https://earthquake.usgs.gov${req.url?.replace(/^\/api\/usgs/, '')}`;

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
