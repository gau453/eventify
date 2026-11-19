/**
 * GET /api/verify-pass?token=...
 * Looks up ticket details and admission status
 */

const { getRegistrationByToken } = require('../lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const token = (url.searchParams.get('token') || '').trim();

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token parameter is required' });
  }

  try {
    const reg = await getRegistrationByToken(token);
    if (!reg) {
      return res.status(404).json({ success: false, error: 'Pass token not found or invalid' });
    }

    return res.status(200).json({
      success: true,
      registration: reg,
      alreadyCheckedIn: Boolean(reg.checkedIn),
      checkedInAt: reg.checkedInAt
    });

  } catch (err) {
    console.error('Error verifying pass:', err);
    return res.status(500).json({ success: false, error: 'Server error verifying pass' });
  }
};
