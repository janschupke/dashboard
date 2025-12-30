const handler = async (req, res) => {
  try {
    // Parse query parameters
    const urlObj = new URL(`http://localhost${req.url || ''}`);
    // TODO: support different time ranges via ?range= parameter (e.g., '1D', '1W', '1M', '1Y')
    const range = urlObj.searchParams.get('range') || '1D';

    // Trading Economics URL for uranium prices
    // NOTE: This URL needs to be verified - may require authentication or have changed
    const tradingEconomicsUrl = 'https://tradingeconomics.com/commodity/uranium';

    // Fetch HTML from Trading Economics
    const response = await fetch(tradingEconomicsUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch uranium data: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Return HTML for client-side parsing
    res.status(200);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Uranium HTML API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch uranium data',
      details: error.message,
    });
  }
};

export default handler;
