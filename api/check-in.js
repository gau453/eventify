/**
 * POST /api/check-in
 * Atomic gate check-in with duplicate admission rejection (HTTP 409)
 * Organiser privileges enforced
 */

const { checkInAttendee } = require('../lib/db');
const { requireOrganiser } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Verify Organiser authorization
  const auth = requireOrganiser(req);
  if (!auth.authorized) {
    return res.status(auth.status).json({ success: false, error: auth.error });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const token = (body.token || '').trim();

    if (!token) {
      return res.status(400).json({ success: false, error: 'Pass token is required for check-in.' });
    }

    const gateOfficer = `${auth.user.name} (${auth.user.organisation || 'Gate'})`;
    const result = await checkInAttendee(token, gateOfficer);

    if (!result.found) {
      return res.status(404).json({ success: false, error: 'Pass token not found or invalid.' });
    }

    if (result.alreadyCheckedIn) {
      return res.status(409).json({
        success: false,
        alreadyCheckedIn: true,
        checkedInAt: result.checkedInAt,
        error: `Duplicate check-in rejected. Already admitted at ${new Date(result.checkedInAt).toLocaleTimeString()}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Attendee admitted successfully!',
      checkedInAt: result.checkedInAt,
      registration: result.registration
    });

  } catch (err) {
    console.error('Check-in error:', err);
    return res.status(500).json({ success: false, error: 'Server error during admission check-in.' });
  }
};
