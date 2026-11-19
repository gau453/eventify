/**
 * GET /api/qr?text=...
 * Dynamic SVG QR Code generator with Edge cache headers
 */

const QRCode = require('qrcode');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const text = (url.searchParams.get('text') || url.searchParams.get('token') || '').trim();

  if (!text) {
    return res.status(400).send('Missing text or token parameter');
  }

  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#172B45',
        light: '#FFFFFF'
      }
    });

    res.setHeader('Content-Type', 'image/svg+xml; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(svg);

  } catch (err) {
    console.error('Error generating QR:', err);
    return res.status(500).send('Error generating QR code');
  }
};
