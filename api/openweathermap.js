const handler = async (req, res) => {
  // Parse the URL and query params
  const urlObj = new URL(
    `https://api.openweathermap.org${req.url?.replace(/^\/api\/openweathermap/, '')}`,
  );

  // If appid is missing, inject from process.env
  if (!urlObj.searchParams.get('appid') && process.env.OPENWEATHERMAP_API_KEY) {
    urlObj.searchParams.set('appid', process.env.OPENWEATHERMAP_API_KEY);
  }

  const url = urlObj.toString();

  // Only send minimal headers - don't forward client headers
  const headers = {
    'User-Agent': 'Dashboard/1.0',
    Accept: 'application/json',
  };

  try {
    const apiRes = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await apiRes.arrayBuffer();
    res.status(apiRes.status);
    apiRes.headers.forEach((value, key) => {
      // Only forward content-type header
      if (key.toLowerCase() === 'content-type') {
        res.setHeader(key, value);
      }
    });
    res.send(Buffer.from(data));
  } catch (error) {
    console.error('OpenWeatherMap API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
