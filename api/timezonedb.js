const handler = async (req, res) => {
  // Extract query parameters from the request
  const urlObj = new URL(`https://api.timezonedb.com${req.url?.replace(/^\/api\/timezonedb/, '')}`);
  const queryParams = Object.fromEntries(urlObj.searchParams.entries());

  // Add API key if not present
  if (!queryParams.key && process.env.TIMEZONEDB_API_KEY) {
    queryParams.key = process.env.TIMEZONEDB_API_KEY;
  }

  try {
    const apiRes = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?${new URLSearchParams(queryParams)}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Dashboard/1.0)',
        Accept: 'application/json',
      },
    });

    const data = await apiRes.text();

    // Set response headers
    res.status(apiRes.status);
    res.setHeader('Content-Type', apiRes.headers.get('content-type') || 'application/json');

    // Send the response
    res.send(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = handler;
