/**
 * EVENTIFY — Hybrid Local Development & API Bridge Server
 * - Dispatches all /api/* requests directly through Vercel-compatible serverless handler modules
 * - Preserves exact URL rewrites for Student Dashboard, Organiser Dashboard, Auth screens & Gate Pass Verification
 * - Serves static assets, fonts, icons, styles and client-side bundles
 * - Seamlessly runs on dual ports (3000 primary, 3001 secondary fallback)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config();
} catch (e) {}

const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Express/Vercel compatibility wrapper for Node http.ServerResponse
function wrapResponse(res) {
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.json = function(data) {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=UTF-8');
      res.setHeader('Cache-Control', 'no-store');
    }
    res.end(JSON.stringify(data));
    return res;
  };
  res.send = function(data) {
    if (typeof data === 'object' && !Buffer.isBuffer(data)) {
      return res.json(data);
    }
    res.end(data);
    return res;
  };
  return res;
}

// Helpers: Parse JSON Request Body (up to 5MB for persistent image uploads)
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

// Pre-load Vercel Serverless Handlers
const handlers = {
  login: require('./api/auth/login'),
  register: require('./api/auth/register'),
  forgotPassword: require('./api/auth/forgot-password'),
  resetPassword: require('./api/auth/reset-password'),
  me: require('./api/auth/me'),
  logout: require('./api/auth/logout'),
  events: require('./api/events/index'),
  banner: require('./api/events/banner'),
  bannerUpload: require('./api/events/banner-upload'),
  registrations: require('./api/registrations'),
  verifyPass: require('./api/verify-pass'),
  checkIn: require('./api/check-in'),
  qr: require('./api/qr')
};

// Unified Request Router
async function handleRequest(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();

  // ================= 1. API ROUTES (Vercel Serverless Modules) =================
  if (pathname.startsWith('/api/')) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      try {
        req.body = await parseJsonBody(req);
      } catch (err) {
        return sendJson(res, 400, { success: false, error: 'Invalid JSON request payload' });
      }
    }

    const wrappedRes = wrapResponse(res);

    try {
      if (pathname === '/api/auth/login' || pathname === '/api/auth/student/login' || pathname === '/api/auth/organiser/login') {
        return await handlers.login(req, wrappedRes);
      }
      if (pathname === '/api/auth/register' || pathname === '/api/auth/student/signup' || pathname === '/api/auth/organiser/signup') {
        return await handlers.register(req, wrappedRes);
      }
      if (pathname === '/api/auth/forgot-password' || pathname === '/api/auth/student/forgot-password' || pathname === '/api/auth/organiser/forgot-password') {
        return await handlers.forgotPassword(req, wrappedRes);
      }
      if (pathname === '/api/auth/reset-password') {
        return await handlers.resetPassword(req, wrappedRes);
      }
      if (pathname === '/api/auth/me') {
        return await handlers.me(req, wrappedRes);
      }
      if (pathname === '/api/auth/logout') {
        return await handlers.logout(req, wrappedRes);
      }
      if (pathname === '/api/events') {
        return await handlers.events(req, wrappedRes);
      }
      if (pathname === '/api/events/banner') {
        return await handlers.banner(req, wrappedRes);
      }
      if (pathname === '/api/events/banner-upload') {
        return await handlers.bannerUpload(req, wrappedRes);
      }
      if (pathname === '/api/registrations') {
        return await handlers.registrations(req, wrappedRes);
      }
      if (pathname === '/api/verify-pass') {
        return await handlers.verifyPass(req, wrappedRes);
      }
      if (pathname === '/api/check-in') {
        return await handlers.checkIn(req, wrappedRes);
      }
      if (pathname === '/api/qr') {
        return await handlers.qr(req, wrappedRes);
      }

      return sendJson(res, 404, { success: false, error: `API route not found: ${pathname}` });
    } catch (apiErr) {
      console.error(`Error handling ${method} ${pathname}:`, apiErr);
      if (!res.headersSent) {
        return sendJson(res, 500, { success: false, error: 'Internal server error' });
      }
    }
    return;
  }

  // ================= 2. ROUTE REWRITES (SPA & CLEAN URLS) =================
  if (pathname === '/verify') {
    const verifyFile = path.join(PUBLIC_DIR, 'verify.html');
    return fs.readFile(verifyFile, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading verification portal');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  }

  const organiserDashboardRoutes = [
    '/organiser/dashboard',
    '/organiser',
    '/organiser/events',
    '/organiser/create',
    '/organiser/registrations',
    '/organiser/attendees',
    '/organiser/tickets',
    '/organiser/analytics',
    '/organiser/profile'
  ];

  if (organiserDashboardRoutes.includes(pathname)) {
    const organiserDashboardFile = path.join(PUBLIC_DIR, 'organiser-dashboard.html');
    return fs.readFile(organiserDashboardFile, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading organiser dashboard');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  }

  const dashboardRoutes = [
    '/student/dashboard',
    '/dashboard',
    '/student'
  ];

  if (dashboardRoutes.includes(pathname)) {
    const dashboardFile = path.join(PUBLIC_DIR, 'dashboard.html');
    return fs.readFile(dashboardFile, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading dashboard');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  }

  const authRoutes = [
    '/student/login',
    '/student/signup',
    '/student/forgot-password',
    '/organiser/login',
    '/organiser/signup',
    '/organiser/forgot-password',
    '/auth',
    '/login'
  ];

  if (authRoutes.includes(pathname)) {
    const authFile = path.join(PUBLIC_DIR, 'auth.html');
    return fs.readFile(authFile, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading authentication module');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  }

  // ================= 3. STATIC FILE SERVING =================
  let reqPath = pathname;
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Clean fallback for client routing
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (indexErr, indexData) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache' });
        res.end(indexData);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

// Export request handler for Vercel / serverless environments
module.exports = handleRequest;

// Bind to TCP port (supports Render process.env.PORT or local 3000/3001 fallback)
if (require.main === module) {
  const port = parseInt(process.env.PORT, 10) || 3000;
  const srv = http.createServer(handleRequest);
  srv.listen(port, '0.0.0.0', () => {
    console.log(`Eventify server running on port ${port}`);
  });
  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !process.env.PORT) {
      const fallback = http.createServer(handleRequest);
      fallback.listen(3001, () => {
        console.log(`Eventify server running at http://localhost:3001`);
      });
    } else {
      console.error(`Server error on port ${port}:`, err);
    }
  });
}
