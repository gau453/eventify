/**
 * POST /api/auth/register (Student & Organiser Sign-up)
 */

const crypto = require('crypto');
const { getUserByEmail, createUser } = require('../../lib/db');
const { hashPassword, signJwt, serializeAuthCookie } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const isOrganiser = req.url.includes('organiser') || body.role === 'organiser';
    const role = isOrganiser ? 'organiser' : 'student';

    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const confirmPassword = body.confirmPassword || '';

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    if (!body.termsAccepted) {
      return res.status(400).json({ success: false, error: 'You must accept the Terms of Service to continue.' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists. Please sign in instead.' });
    }

    let newUser;
    if (role === 'student') {
      const name = (body.name || '').trim();
      const college = (body.college || '').trim();
      if (!name) return res.status(400).json({ success: false, error: 'Full name is required.' });
      if (!college) return res.status(400).json({ success: false, error: 'College / University is required.' });

      newUser = {
        id: 'stu_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
        role: 'student',
        name,
        email,
        college,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
      };
    } else {
      const organisation = (body.organisation || body.clubName || '').trim();
      const contactName = (body.contactName || body.name || '').trim();
      const phone = (body.phone || '').trim();

      if (!organisation) return res.status(400).json({ success: false, error: 'Organisation / Club Name is required.' });
      if (!contactName) return res.status(400).json({ success: false, error: "Contact Person's Full Name is required." });

      newUser = {
        id: 'org_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
        role: 'organiser',
        name: contactName,
        organisation,
        email,
        phone,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
      };
    }

    await createUser(newUser);

    const sessionPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      college: newUser.college,
      organisation: newUser.organisation,
      phone: newUser.phone
    };

    const token = signJwt(sessionPayload);
    res.setHeader('Set-Cookie', serializeAuthCookie(token));

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: sessionPayload
    });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error. Please try again.' });
  }
};
