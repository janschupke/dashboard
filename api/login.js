const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Get hashed password from environment variable
    const hashedPassword = process.env.PASSWORD;

    if (!hashedPassword) {
      console.error('PASSWORD environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Compare password with hashed password
    const isValid = await bcrypt.compare(password, hashedPassword);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Validate JWT_SECRET is set
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create JWT token
    const token = jwt.sign({ authenticated: true }, jwtSecret, { expiresIn: '7d' });

    // Set HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
