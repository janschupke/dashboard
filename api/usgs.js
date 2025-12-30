const handler = async (req, res) => {
  const url = `https://earthquake.usgs.gov${req.url?.replace(/^\/api\/usgs/, '')}`;

  // Only send minimal headers
  const headers = {
    'User-Agent': 'Dashboard/1.0',
    'Accept': 'application/json',
  };

  try {
    const apiRes = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await apiRes.arrayBuffer();

    // Log errors for debugging
    if (!apiRes.ok) {
      const errorText = Buffer.from(data).toString('utf-8').substring(0, 500);
      console.error('USGS API Error:', {
        status: apiRes.status,
        statusText: apiRes.statusText,
        url,
        response: errorText,
      });
    }

    res.status(apiRes.status);
    res.setHeader('Content-Type', apiRes.headers.get('content-type') || 'application/json');
    res.send(Buffer.from(data));
  } catch (error) {
    console.error('USGS API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = handler;
