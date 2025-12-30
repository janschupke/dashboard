const handler = async (req, res) => {
  // Parse the URL and ensure format=jsondata is included
  const urlObj = new URL(`https://sdw-wsrest.ecb.europa.eu${req.url?.replace(/^\/api\/ecb/, '')}`);

  // CRITICAL: Always add format=jsondata if not present
  if (!urlObj.searchParams.get('format')) {
    urlObj.searchParams.set('format', 'jsondata');
  }

  const url = urlObj.toString();

  try {
    const apiRes = await fetch(url, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Dashboard/1.0)',
        Accept: 'application/json',
      },
    });

    const data = await apiRes.text();

    // Set response headers
    res.status(apiRes.status);
    res.setHeader('Content-Type', apiRes.headers.get('content-type') || 'application/json');

    // Log errors for debugging
    if (!apiRes.ok) {
      console.error('ECB API Error:', {
        status: apiRes.status,
        statusText: apiRes.statusText,
        url,
        response: data.substring(0, 500), // First 500 chars
      });
    }

    res.send(data);
  } catch (error) {
    console.error('ECB API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};

export default handler;
