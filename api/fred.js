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
  // Remove /api/fred prefix and ensure /fred is in the path
  const path = req.url?.replace(/^\/api\/fred/, '') || '';
  const urlObj = new URL(`https://api.stlouisfed.org/fred${path}`);

  // If api_key is missing, inject from process.env
  if (!urlObj.searchParams.get('api_key') && process.env.FRED_API_KEY) {
    urlObj.searchParams.set('api_key', process.env.FRED_API_KEY);
  }

  // Check if API key is available
  if (!urlObj.searchParams.get('api_key')) {
    return res.status(400).json({
      error: 'FRED API key is required. Set FRED_API_KEY in environment variables.',
    });
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

    // Log errors for debugging
    if (!apiRes.ok) {
      const errorText = Buffer.from(data).toString('utf-8').substring(0, 500);
      console.error('FRED API Error:', {
        status: apiRes.status,
        statusText: apiRes.statusText,
        url: sanitizeUrlForLogging(url, ['api_key']),
        response: errorText,
      });
    }

    res.status(apiRes.status);
    res.setHeader('Content-Type', apiRes.headers.get('content-type') || 'application/json');
    res.send(Buffer.from(data));
  } catch (error) {
    console.error('FRED API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};

export default handler;
