import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GoldApiResponse {
  name: string;
  price: number;
  symbol: string;
  updatedAt: string;
  updatedAtReadable: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract symbol from path like /api/precious-metals/XAU
    const path = req.url || '';
    const match = path.match(/^\/api\/precious-metals\/([^/]+)/);

    if (!match) {
      return res.status(400).json({ error: 'Missing metal symbol in path' });
    }

    const symbol = match[1].toUpperCase();

    // Validate symbol
    if (!['XAU', 'XAG'].includes(symbol)) {
      return res.status(400).json({ error: 'Invalid metal symbol. Supported: XAU, XAG' });
    }

    // Fetch metal price from gold-api.com
    const response = await fetch(`https://api.gold-api.com/price/${symbol}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${symbol} data: ${response.status}`);
    }

    const data: GoldApiResponse = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching precious metals data:', error);
    res.status(500).json({ error: 'Failed to fetch precious metals data' });
  }
}
