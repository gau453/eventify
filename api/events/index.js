/**
 * /api/events (GET, POST, DELETE)
 * Strict server-side authorization and ownership enforcement
 */

const { getEvents, getEventById, createEvent, deleteEvent } = require('../../lib/db');
const { getAuthenticatedUser, requireOrganiser } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  const method = req.method;

  // 1. GET /api/events
  if (method === 'GET') {
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const organiserEmail = url.searchParams.get('organiserEmail');
      const organiserId = url.searchParams.get('organiserId');

      const events = await getEvents({ organiserEmail, organiserId });
      return res.status(200).json({ success: true, events });
    } catch (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ success: false, error: 'Server error fetching events.' });
    }
  }

  // 2. POST /api/events (Create Event - Organiser Only)
  if (method === 'POST') {
    const auth = requireOrganiser(req);
    if (!auth.authorized) {
      return res.status(auth.status).json({ success: false, error: auth.error });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (!body.title) {
        return res.status(400).json({ success: false, error: 'Event title is required.' });
      }

      const user = auth.user;
      const newEvent = {
        id: body.id || ('evt-' + Date.now()),
        title: body.title.trim(),
        description: body.description || '',
        category: body.category || 'Technology',
        dates: body.dates || 'TBD',
        startTime: body.startTime || '',
        endTime: body.endTime || '',
        venue: body.venue || 'Campus Venue',
        address: body.address || '',
        type: body.type || 'In-Person',
        capacity: parseInt(body.capacity, 10) || 100,
        registeredCount: 0,
        attendedCount: 0,
        status: body.status || 'Registration Open',
        thumbnail: body.thumbnail || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
        tags: Array.isArray(body.tags) ? body.tags : [body.category || 'Event'],
        eligibility: body.eligibility || '',
        agenda: body.agenda || '',
        // Ownership bound strictly to authenticated organiser
        organiser: user.organisation || user.name || 'Organiser',
        organiserEmail: user.email,
        organiserId: user.id,
        createdAt: new Date().toISOString()
      };

      await createEvent(newEvent);

      return res.status(201).json({
        success: true,
        message: 'Event created successfully!',
        event: newEvent
      });
    } catch (err) {
      console.error('Error creating event:', err);
      return res.status(500).json({ success: false, error: 'Server error creating event.' });
    }
  }

  // 3. DELETE /api/events (Delete Event - Owner Only)
  if (method === 'DELETE') {
    const auth = requireOrganiser(req);
    if (!auth.authorized) {
      return res.status(auth.status).json({ success: false, error: auth.error });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const eventId = body.id || url.searchParams.get('id');

      if (!eventId) {
        return res.status(400).json({ success: false, error: 'Event ID is required.' });
      }

      // Fetch event and verify strict ownership
      const event = await getEventById(eventId);
      if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found.' });
      }

      const user = auth.user;
      const isOwner = (
        (event.organiserId && event.organiserId === user.id) ||
        (event.organiserEmail && event.organiserEmail.toLowerCase() === user.email.toLowerCase())
      );

      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Forbidden. You can only delete events hosted by your organisation.' });
      }

      await deleteEvent(eventId);
      return res.status(200).json({ success: true, message: 'Event deleted successfully.' });

    } catch (err) {
      console.error('Error deleting event:', err);
      return res.status(500).json({ success: false, error: 'Server error deleting event.' });
    }
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};
