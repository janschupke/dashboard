/**
 * Sanitize URL by removing sensitive query parameters for logging
 * @param {string} urlString - The URL to sanitize
 * @param {string[]} sensitiveParams - Array of parameter names to remove
 * @returns {string} - URL with sensitive parameters removed
 */
const sanitizeUrlForLogging = (urlString, sensitiveParams) => {
  try {
    const url = new URL(urlString);
    sensitiveParams.forEach((param) => {
      url.searchParams.delete(param);
    });
    return url.toString();
  } catch {
    // If URL parsing fails, return a safe placeholder
    return '[invalid URL]';
  }
};

const handler = async (req, res) => {
  // Parse the URL and query params
  const urlObj = new URL(
    `https://www.alphavantage.co${req.url?.replace(/^\/api\/alpha-vantage/, '')}`,
  );

  // If apikey is missing, inject from process.env
  if (!urlObj.searchParams.get('apikey') && process.env.ALPHA_VANTAGE_API_KEY) {
    urlObj.searchParams.set('apikey', process.env.ALPHA_VANTAGE_API_KEY);
  }

  // Check if API key is available
  if (!urlObj.searchParams.get('apikey')) {
    return res.status(400).json({
      error:
        'Alpha Vantage API key is required. Set ALPHA_VANTAGE_API_KEY in environment variables.',
    });
  }

  const url = urlObj.toString();

  // Only send minimal headers
  const headers = {
    'User-Agent': 'Dashboard/1.0',
    Accept: 'application/json',
  };

  try {
    const apiRes = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await apiRes.text();

    // Check for Alpha Vantage error messages in response
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      // Not JSON, send as-is
      res.status(apiRes.status);
      res.setHeader('Content-Type', apiRes.headers.get('content-type') || 'text/plain');
      return res.send(data);
    }

    // Check for error messages
    if (jsonData['Error Message'] || jsonData['Note']) {
      const errorMsg = jsonData['Error Message'] || jsonData['Note'];
      console.error('Alpha Vantage API Error:', {
        url: sanitizeUrlForLogging(url, ['apikey']),
        error: errorMsg,
        response: jsonData,
      });
      return res.status(400).json({
        error: 'Alpha Vantage API error',
        message: errorMsg,
        details: jsonData,
      });
    }

    res.status(apiRes.status);
    res.setHeader('Content-Type', 'application/json');
    res.json(jsonData);
  } catch (error) {
    console.error('Alpha Vantage API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export default handler;
