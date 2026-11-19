const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = __dirname;
const USERS_FILE = path.join(PUBLIC_DIR, 'data', 'users.json');
const REGISTRATIONS_FILE = path.join(PUBLIC_DIR, 'data', 'registrations.json');
const EVENTS_FILE = path.join(PUBLIC_DIR, 'data', 'events.json');

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

// In-Memory Sessions & Reset Tokens Store
const SESSIONS = new Map();
const RESET_TOKENS = new Map();

// Helpers: Password Hashing with Scrypt
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, key] = stored.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey, 'hex'));
}

// Helpers: Read & Write Users Database
function getUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

function saveUsers(users) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving users file:', err);
  }
}

// Helpers: Read & Write Registrations Database
function getRegistrations() {
  try {
    if (!fs.existsSync(REGISTRATIONS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(REGISTRATIONS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading registrations file:', err);
    return [];
  }
}

function saveRegistrations(regs) {
  try {
    const dir = path.dirname(REGISTRATIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(regs, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving registrations file:', err);
  }
}

// Helpers: Read & Write Events Database
function getEvents() {
  try {
    if (!fs.existsSync(EVENTS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(EVENTS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading events file:', err);
    return [];
  }
}

function saveEvents(events) {
  try {
    const dir = path.dirname(EVENTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving events file:', err);
  }
}

// Helpers: Parse JSON Request Body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2e6) { // 2MB max
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

// Route Handler
async function handleRequest(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();

  // ================= API ROUTES =================

  // 1. SIGN UP (Student or Organiser)
  if (method === 'POST' && (pathname === '/api/auth/register' || pathname === '/api/auth/student/signup' || pathname === '/api/auth/organiser/signup')) {
    try {
      const data = await parseJsonBody(req);
      const isOrganiser = pathname.includes('organiser') || data.role === 'organiser';
      const role = isOrganiser ? 'organiser' : 'student';

      const email = (data.email || '').trim().toLowerCase();
      const password = data.password || '';
      const confirmPassword = data.confirmPassword || '';

      // Validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendJson(res, 400, { success: false, error: 'Please enter a valid email address.' });
      }

      if (!password || password.length < 8) {
        return sendJson(res, 400, { success: false, error: 'Password must be at least 8 characters long.' });
      }

      if (password !== confirmPassword) {
        return sendJson(res, 400, { success: false, error: 'Passwords do not match.' });
      }

      if (!data.termsAccepted) {
        return sendJson(res, 400, { success: false, error: 'You must accept the Terms of Service to continue.' });
      }

      const users = getUsers();
      if (users.some(u => u.email.toLowerCase() === email)) {
        return sendJson(res, 409, { success: false, error: 'An account with this email already exists. Please sign in instead.' });
      }

      let newUser;
      if (role === 'student') {
        const name = (data.name || '').trim();
        const college = (data.college || '').trim();
        if (!name) {
          return sendJson(res, 400, { success: false, error: 'Full name is required.' });
        }
        if (!college) {
          return sendJson(res, 400, { success: false, error: 'College / University is required.' });
        }

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
        // Organiser
        const organisation = (data.organisation || data.clubName || '').trim();
        const contactName = (data.contactName || data.name || '').trim();
        const phone = (data.phone || '').trim();

        if (!organisation) {
          return sendJson(res, 400, { success: false, error: 'Organisation / Club Name is required.' });
        }
        if (!contactName) {
          return sendJson(res, 400, { success: false, error: "Contact Person's Full Name is required." });
        }

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

      users.push(newUser);
      saveUsers(users);

      // Create session
      const token = crypto.randomBytes(32).toString('hex');
      const sessionData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        college: newUser.college,
        organisation: newUser.organisation,
        phone: newUser.phone,
        createdAt: Date.now()
      };
      SESSIONS.set(token, sessionData);

      return sendJson(res, 201, {
        success: true,
        message: 'Account created successfully!',
        token,
        user: sessionData
      });
    } catch (err) {
      console.error('Registration error:', err);
      return sendJson(res, 500, { success: false, error: 'Internal server error. Please try again.' });
    }
  }

  // 2. SIGN IN (Student or Organiser)
  if (method === 'POST' && (pathname === '/api/auth/login' || pathname === '/api/auth/student/login' || pathname === '/api/auth/organiser/login')) {
    try {
      const data = await parseJsonBody(req);
      const requestedRole = pathname.includes('organiser') ? 'organiser' : (data.role || 'student');

      const email = (data.email || '').trim().toLowerCase();
      const password = data.password || '';

      if (!email || !password) {
        return sendJson(res, 400, { success: false, error: 'Please enter both your email address and password.' });
      }

      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email);

      if (!user) {
        return sendJson(res, 401, { success: false, error: 'No account found with this email. Please check your spelling or sign up.' });
      }

      if (!verifyPassword(password, user.passwordHash)) {
        return sendJson(res, 401, { success: false, error: 'Incorrect password. Please try again or use Forgot Password.' });
      }

      // Check role mismatch and give friendly hint
      if (user.role !== requestedRole) {
        if (user.role === 'organiser') {
          return sendJson(res, 403, { 
            success: false, 
            error: 'This account is registered as an Event Organiser. Please sign in via the Organiser Portal.',
            suggestedPortal: '/organiser/login'
          });
        } else {
          return sendJson(res, 403, { 
            success: false, 
            error: 'This account is registered as a Student. Please sign in via the Student Portal.',
            suggestedPortal: '/student/login'
          });
        }
      }

      // Create session
      const token = crypto.randomBytes(32).toString('hex');
      const sessionData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        organisation: user.organisation,
        phone: user.phone,
        createdAt: Date.now()
      };
      SESSIONS.set(token, sessionData);

      return sendJson(res, 200, {
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: sessionData
      });
    } catch (err) {
      console.error('Login error:', err);
      return sendJson(res, 500, { success: false, error: 'Internal server error. Please try again.' });
    }
  }

  // 3. FORGOT PASSWORD
  if (method === 'POST' && (pathname === '/api/auth/forgot-password' || pathname === '/api/auth/student/forgot-password' || pathname === '/api/auth/organiser/forgot-password')) {
    try {
      const data = await parseJsonBody(req);
      const email = (data.email || '').trim().toLowerCase();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendJson(res, 400, { success: false, error: 'Please enter a valid email address.' });
      }

      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email);

      // Always respond with success to prevent user enumeration attacks
      const resetToken = crypto.randomBytes(24).toString('hex');
      RESET_TOKENS.set(resetToken, { email, createdAt: Date.now() });

      return sendJson(res, 200, {
        success: true,
        message: 'Password reset link sent! Please check your inbox for instructions.',
        userFound: !!user
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: 'Error processing password reset request.' });
    }
  }

  // 4. GET CURRENT SESSION (/api/auth/me)
  if (method === 'GET' && pathname === '/api/auth/me') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (token && SESSIONS.has(token)) {
      return sendJson(res, 200, { success: true, user: SESSIONS.get(token) });
    }
    return sendJson(res, 401, { success: false, user: null });
  }

  // 5. LOGOUT (/api/auth/logout)
  if (method === 'POST' && pathname === '/api/auth/logout') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token && SESSIONS.has(token)) {
      SESSIONS.delete(token);
    }
    return sendJson(res, 200, { success: true, message: 'Logged out successfully.' });
  }

  // ================= QR & PASS VERIFICATION API =================

  // 6. DYNAMIC REAL SCANNABLE QR GENERATION (/api/qr)
  if (method === 'GET' && pathname === '/api/qr') {
    const text = urlObj.searchParams.get('text') || urlObj.searchParams.get('token') || '';
    if (!text) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing text or token parameter');
      return;
    }

    try {
      QRCode.toString(text, { type: 'svg', margin: 1 }, (err, svg) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error generating QR code');
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'image/svg+xml; charset=UTF-8',
          'Cache-Control': 'public, max-age=86400'
        });
        res.end(svg);
      });
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error generating QR code');
    }
    return;
  }

  // 7. GET REGISTRATIONS (/api/registrations)
  if (method === 'GET' && pathname === '/api/registrations') {
    const regs = getRegistrations();
    const host = req.headers.host || 'localhost:3001';
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const enriched = regs.map(r => ({
      ...r,
      verificationUrl: `${proto}://${host}/verify?token=${encodeURIComponent(r.token)}`,
      qrUrl: `/api/qr?text=${encodeURIComponent(`${proto}://${host}/verify?token=${r.token}`)}`
    }));
    return sendJson(res, 200, { success: true, registrations: enriched });
  }

  // 8. VERIFY PASS (/api/verify-pass)
  if (method === 'GET' && pathname === '/api/verify-pass') {
    const token = urlObj.searchParams.get('token') || '';
    if (!token) {
      return sendJson(res, 400, { success: false, error: 'Token parameter is required' });
    }
    const regs = getRegistrations();
    const reg = regs.find(r => r.token === token || r.id === token);
    if (!reg) {
      return sendJson(res, 404, { success: false, error: 'Pass token not found or invalid' });
    }
    return sendJson(res, 200, {
      success: true,
      registration: reg,
      alreadyCheckedIn: !!reg.checkedIn,
      checkedInAt: reg.checkedInAt
    });
  }

  // 9. ORGANISER CHECK-IN (/api/check-in)
  if (method === 'POST' && pathname === '/api/check-in') {
    try {
      const body = await parseJsonBody(req);
      const token = (body.token || '').trim();
      if (!token) {
        return sendJson(res, 400, { success: false, error: 'Token is required' });
      }
      const regs = getRegistrations();
      const reg = regs.find(r => r.token === token || r.id === token);
      if (!reg) {
        return sendJson(res, 404, { success: false, error: 'Pass token not found or invalid' });
      }
      if (reg.checkedIn) {
        return sendJson(res, 409, {
          success: false,
          alreadyCheckedIn: true,
          checkedInAt: reg.checkedInAt,
          error: `Duplicate check-in rejected. Already admitted at ${new Date(reg.checkedInAt).toLocaleTimeString()}`
        });
      }

      reg.checkedIn = true;
      reg.checkedInAt = new Date().toISOString();
      reg.checkedInBy = 'Organiser Gate 1';
      saveRegistrations(regs);

      return sendJson(res, 200, {
        success: true,
        message: 'Attendee checked in successfully',
        checkedInAt: reg.checkedInAt
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: 'Server error during check-in' });
    }
  }

  // ================= EVENTS API =================

  // 10. GET EVENTS (/api/events)
  if (method === 'GET' && pathname === '/api/events') {
    let events = getEvents();
    const orgEmail = urlObj.searchParams.get('organiserEmail');
    const orgId = urlObj.searchParams.get('organiserId');
    if (orgEmail) {
      events = events.filter(e => (e.organiserEmail && e.organiserEmail.toLowerCase() === orgEmail.toLowerCase()));
    } else if (orgId) {
      events = events.filter(e => e.organiserId === orgId);
    }
    return sendJson(res, 200, { success: true, events });
  }

  // 11. CREATE EVENT (/api/events)
  if (method === 'POST' && pathname === '/api/events') {
    try {
      const newEvent = await parseJsonBody(req);
      if (!newEvent.title) {
        return sendJson(res, 400, { success: false, error: 'Event title is required.' });
      }

      const events = getEvents();
      if (!newEvent.id) {
        newEvent.id = 'evt-' + Date.now();
      }
      newEvent.createdAt = newEvent.createdAt || new Date().toISOString();
      newEvent.registeredCount = newEvent.registeredCount || 0;
      newEvent.attendedCount = newEvent.attendedCount || 0;

      events.unshift(newEvent);
      saveEvents(events);

      return sendJson(res, 201, {
        success: true,
        message: 'Event created successfully!',
        event: newEvent
      });
    } catch (err) {
      console.error('Error creating event:', err);
      return sendJson(res, 500, { success: false, error: 'Server error creating event.' });
    }
  }

  // 12. DELETE EVENT (/api/events)
  if (method === 'DELETE' && pathname === '/api/events') {
    try {
      const body = await parseJsonBody(req);
      const eventId = body.id || urlObj.searchParams.get('id');

      if (!eventId) {
        return sendJson(res, 400, { success: false, error: 'Event ID is required for deletion.' });
      }

      let events = getEvents();
      const initialCount = events.length;
      events = events.filter(e => e.id !== eventId);

      if (events.length === initialCount) {
        return sendJson(res, 404, { success: false, error: 'Event not found.' });
      }

      saveEvents(events);
      return sendJson(res, 200, { success: true, message: 'Event deleted successfully.' });
    } catch (err) {
      console.error('Error deleting event:', err);
      return sendJson(res, 500, { success: false, error: 'Server error deleting event.' });
    }
  }

  // 13. UPDATE EVENT BANNER (/api/events/banner)
  if (method === 'POST' && pathname === '/api/events/banner') {
    try {
      const body = await parseJsonBody(req);
      const { id, thumbnail } = body;
      if (!id || !thumbnail) {
        return sendJson(res, 400, { success: false, error: 'Event ID and thumbnail are required.' });
      }

      const events = getEvents();
      const event = events.find(e => e.id === id);
      if (!event) {
        return sendJson(res, 404, { success: false, error: 'Event not found.' });
      }

      event.thumbnail = thumbnail;
      saveEvents(events);

      return sendJson(res, 200, {
        success: true,
        message: 'Banner updated successfully!',
        event
      });
    } catch (err) {
      console.error('Error updating banner:', err);
      return sendJson(res, 500, { success: false, error: 'Server error updating banner.' });
    }
  }

  // ================= ROUTE REWRITES FOR AUTH SCREENS & DASHBOARDS =================
  if (pathname === '/verify') {
    const verifyFile = path.join(PUBLIC_DIR, 'verify.html');
    fs.readFile(verifyFile, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading verification portal');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
    return;
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
    fs.readFile(organiserDashboardFile, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading organiser dashboard');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
    return;
  }

  const dashboardRoutes = [
    '/student/dashboard',
    '/dashboard',
    '/student'
  ];

  if (dashboardRoutes.includes(pathname)) {
    const dashboardFile = path.join(PUBLIC_DIR, 'dashboard.html');
    fs.readFile(dashboardFile, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading dashboard');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
    return;
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
    fs.readFile(authFile, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading authentication module');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
    return;
  }

  // ================= STATIC FILE SERVING =================
  let reqPath = pathname;
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If it doesn't match a static file, fallback to index.html
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

const PORTS = [3000, 3001];
PORTS.forEach(port => {
  const srv = http.createServer(handleRequest);
  srv.listen(port, () => {
    console.log(`Eventify server running at http://localhost:${port}`);
  });
  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} occupied, skipping.`);
    } else {
      console.error(`Server error on port ${port}:`, err);
    }
  });
});
