/**
 * POST /api/events/banner
 * Updates event banner URL with strict owner validation
 */

const { getEventById, updateEvent } = require('../../lib/db');
const { requireOrganiser } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const auth = requireOrganiser(req);
  if (!auth.authorized) {
    return res.status(auth.status).json({ success: false, error: auth.error });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { id, thumbnail } = body;

    if (!id || !thumbnail) {
      return res.status(400).json({ success: false, error: 'Event ID and thumbnail are required.' });
    }

    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    // Ownership check
    const user = auth.user;
    const isOwner = (
      (event.organiserId && event.organiserId === user.id) ||
      (event.organiserEmail && event.organiserEmail.toLowerCase() === user.email.toLowerCase())
    );

    if (!isOwner) {
      return res.status(403).json({ success: false, error: 'Forbidden. You do not own this event.' });
    }

    await updateEvent(id, { thumbnail });

    return res.status(200).json({
      success: true,
      message: 'Banner updated successfully!',
      thumbnail
    });

  } catch (err) {
    console.error('Error updating banner:', err);
    return res.status(500).json({ success: false, error: 'Server error updating banner.' });
  }
};
