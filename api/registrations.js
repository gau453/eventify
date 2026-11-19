/**
 * GET /api/registrations
 * Returns enriched registrations with dynamic verification & QR endpoints
 */

const { getRegistrations, getEvents } = require('../lib/db');
const { getAuthenticatedUser } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const eventId = url.searchParams.get('eventId');
    const studentEmail = url.searchParams.get('studentEmail');

    const regs = await getRegistrations({ eventId, studentEmail });

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const proto = req.headers['x-forwarded-proto'] || 'http';

    const enriched = regs.map(r => ({
      ...r,
      verificationUrl: `${proto}://${host}/verify?token=${encodeURIComponent(r.token)}`,
      qrUrl: `/api/qr?text=${encodeURIComponent(`${proto}://${host}/verify?token=${r.token}`)}`
    }));

    return res.status(200).json({ success: true, registrations: enriched });

  } catch (err) {
    console.error('Error fetching registrations:', err);
    return res.status(500).json({ success: false, error: 'Server error fetching registrations.' });
  }
};
