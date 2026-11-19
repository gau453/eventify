/**
 * GET /api/auth/me
 * Returns current authenticated user payload from stateless JWT
 */

const { getAuthenticatedUser } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ success: false, user: null });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      organisation: user.organisation,
      phone: user.phone
    }
  });
};
