const handler = async (req, res) => {
  try {
    // Extract symbol from path (for backward compatibility, but we'll fetch both)
    const path = req.url || '';
    const match = path.match(/^\/api\/precious-metals\/([^/]+)/);
    const requestedSymbol = match ? match[1].toUpperCase() : 'XAU';

    // Validate symbol
    if (!['XAU', 'XAG'].includes(requestedSymbol)) {
      return res.status(400).json({ error: 'Invalid metal symbol. Supported: XAU, XAG' });
    }

    // Make TWO concurrent API calls using Promise.all()
    const [goldResponse, silverResponse] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU'),
      fetch('https://api.gold-api.com/price/XAG'),
    ]);

    // Check both responses
    if (!goldResponse.ok) {
      throw new Error(`Failed to fetch XAU data: ${goldResponse.status}`);
    }
    if (!silverResponse.ok) {
      throw new Error(`Failed to fetch XAG data: ${silverResponse.status}`);
    }

    // Await both JSON responses
    const goldData = await goldResponse.json();
    const silverData = await silverResponse.json();

    // Transform to expected format - pass both to mapper
    const response = {
      gold: {
        price: goldData.price || 0,
        change_24h: 0, // API doesn't provide this
        change_percentage_24h: 0, // API doesn't provide this
      },
      silver: {
        price: silverData.price || 0,
        change_24h: 0, // API doesn't provide this
        change_percentage_24h: 0, // API doesn't provide this
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching precious metals data:', error);
    res.status(500).json({
      error: 'Failed to fetch precious metals data',
      details: error.message,
    });
  }
};

module.exports = handler;
