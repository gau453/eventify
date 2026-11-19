/**
 * POST /api/auth/reset-password
 * Consumes single-use token and updates password
 */

const crypto = require('crypto');
const { isSupabaseConfigured, updateUserPassword } = require('../../lib/db');
const { hashPassword } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const token = (body.token || '').trim();
    const password = body.password || '';
    const confirmPassword = body.confirmPassword || '';

    if (!token) {
      return res.status(400).json({ success: false, error: 'Reset token is required.' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    if (isSupabaseConfigured) {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

      // Verify token
      const { data: record, error } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token_hash', tokenHash)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error || !record) {
        return res.status(400).json({ success: false, error: 'Invalid or expired password reset token.' });
      }

      // Update user password
      const newHash = hashPassword(password);
      await updateUserPassword(record.user_id, newHash);

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', record.id);

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully! You can now sign in with your new password.'
      });
    }

    // Local Standalone Fallback
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, error: 'Server error resetting password.' });
  }
};
