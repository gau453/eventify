/**
 * POST /api/events/banner-upload
 * Uploads local device image to Supabase Storage persistent bucket
 */

const { uploadBannerToStorage } = require('../../lib/db');
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
    const { base64Data, fileName = 'banner.jpg', mimeType = 'image/jpeg' } = body;

    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'Image data is required.' });
    }

    // Strip data URL header if present
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const publicUrl = await uploadBannerToStorage(fileName, buffer, mimeType);

    return res.status(200).json({
      success: true,
      url: publicUrl,
      message: 'Banner uploaded successfully to persistent storage.'
    });

  } catch (err) {
    console.error('Banner upload error:', err);
    return res.status(500).json({ success: false, error: 'Server error uploading banner.' });
  }
};
