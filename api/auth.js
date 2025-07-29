const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse cookies manually since we're in a serverless environment
    const cookies =
      req.headers.cookie?.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {}) || {};

    const authToken = cookies.auth_token;

    if (!authToken) {
      return res.status(401).json({ authenticated: false });
    }

    // Validate JWT_SECRET is set
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify JWT token
    const decoded = jwt.verify(authToken, jwtSecret);

    if (!decoded.authenticated) {
      return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({ authenticated: true });
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ authenticated: false });
  }
};
