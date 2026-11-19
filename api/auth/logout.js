/**
 * POST /api/auth/logout
 * Evicts HttpOnly session cookie
 */

const { serializeClearCookie } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', serializeClearCookie());
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};
