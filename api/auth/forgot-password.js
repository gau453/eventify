/**
 * POST /api/auth/forgot-password
 * Secure Token Generation + Transactional Email Provider Support
 */

const crypto = require('crypto');
const { getUserByEmail, savePasswordResetToken } = require('../../lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = (body.email || '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const user = await getUserByEmail(email);

    // If user exists, generate high-entropy 256-bit token
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour

      await savePasswordResetToken(user.id, tokenHash, expiresAt);

      const proto = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
      const resetLink = `${proto}://${host}/student/forgot-password?token=${rawToken}`;

      const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

      if (process.env.RESEND_API_KEY) {
        // Send email via Resend API
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || 'Eventify <notifications@eventify.edu>',
              to: [user.email],
              subject: 'Eventify — Password Reset Instructions',
              html: `
                <div style="font-family: sans-serif; max-width: 500px; padding: 20px;">
                  <h2 style="color: #172B45;">Password Reset Request</h2>
                  <p>Hello ${user.name},</p>
                  <p>You requested to reset your Eventify account password. Click the link below to set a new password:</p>
                  <p style="margin: 25px 0;">
                    <a href="${resetLink}" style="background-color: #172B45; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password &rarr;</a>
                  </p>
                  <p style="color: #66788C; font-size: 12px;">This link will expire in 60 minutes. If you did not request this, you can safely ignore this email.</p>
                </div>
              `
            })
          });
        } catch (mailErr) {
          console.error('Error dispatching reset email:', mailErr);
        }
      } else if (isProduction) {
        // In production without an email provider configured, do NOT log tokens
        console.warn('[SECURITY] RESEND_API_KEY is not configured in production. Password reset email could not be dispatched.');
      } else {
        // In local development only: log simulated link for testing convenience
        console.log(`[DEV ONLY PASSWORD RESET LINK]: ${resetLink}`);
      }
    }

    // Always respond with success to prevent user enumeration
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been sent.'
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, error: 'Server error processing password reset.' });
  }
};
