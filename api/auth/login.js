/**
 * POST /api/auth/login (also handles student/login and organiser/login)
 */

const { getUserByEmail } = require('../../lib/db');
const { verifyPassword, signJwt, serializeAuthCookie } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const requestedRole = req.url.includes('organiser') ? 'organiser' : (body.role || 'student');

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter both your email address and password.' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'No account found with this email. Please check your spelling or sign up.' });
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }

    // Role mismatch guidance
    if (user.role !== requestedRole) {
      if (user.role === 'organiser') {
        return res.status(403).json({
          success: false,
          error: 'This account is registered as an Event Organiser. Please sign in via the Organiser Portal.',
          suggestedPortal: '/organiser/login'
        });
      } else {
        return res.status(403).json({
          success: false,
          error: 'This account is registered as a Student. Please sign in via the Student Portal.',
          suggestedPortal: '/student/login'
        });
      }
    }

    // Generate Stateless JWT with 7-day expiration
    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      organisation: user.organisation,
      phone: user.phone
    };

    const token = signJwt(sessionPayload);

    // Set Secure HttpOnly Cookie
    res.setHeader('Set-Cookie', serializeAuthCookie(token));

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: sessionPayload
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error. Please try again.' });
  }
};
