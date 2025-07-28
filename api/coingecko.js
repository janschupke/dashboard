const handler = async (req, res) => {
  const url = `https://api.coingecko.com${req.url?.replace(/^\/api\/coingecko/, '')}`;

  try {
    const apiRes = await fetch(url, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Dashboard/1.0)',
        Accept: 'application/json',
        ...(req.headers.authorization && { Authorization: req.headers.authorization }),
        ...(req.headers['content-type'] && {
          'Content-Type': req.headers['content-type'],
        }),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
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
