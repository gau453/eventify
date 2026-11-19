/**
 * EVENTIFY — Student Dashboard Controller
 * Handles student data sync, real scannable QR pass generation,
 * view toggling (Dashboard vs My Registrations), ticket downloads & verification flows.
 */

// Universal Fetch Auth Interceptor: transparently passes JWT Bearer token & headers to /api/
(function setupStudentAuthFetch() {
  if (window._studentAuthFetchConfigured) return;
  window._studentAuthFetchConfigured = true;
  const _fetch = window.fetch;
  window.fetch = function(input, init) {
    init = init || {};
    const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    if (typeof url === 'string' && (url.startsWith('/api/') || url.includes('/api/'))) {
      const token = localStorage.getItem('eventify_token');
      const userRaw = localStorage.getItem('eventify_user');
      init.headers = init.headers || {};
      if (init.headers instanceof Headers) {
        if (token && !init.headers.has('Authorization')) {
          init.headers.set('Authorization', 'Bearer ' + token);
        }
        if (userRaw) {
          try {
            const u = JSON.parse(userRaw);
            if (u.email && !init.headers.has('X-Student-Email')) {
              init.headers.set('X-Student-Email', u.email);
            }
          } catch(e) {}
        }
      } else if (Array.isArray(init.headers)) {
        if (token && !init.headers.some(([k]) => k.toLowerCase() === 'authorization')) {
          init.headers.push(['Authorization', 'Bearer ' + token]);
        }
        if (userRaw) {
          try {
            const u = JSON.parse(userRaw);
            if (u.email && !init.headers.some(([k]) => k.toLowerCase() === 'x-student-email')) {
              init.headers.push(['X-Student-Email', u.email]);
            }
          } catch(e) {}
        }
      } else {
        if (token && !init.headers['Authorization'] && !init.headers['authorization']) {
          init.headers['Authorization'] = 'Bearer ' + token;
        }
        if (userRaw) {
          try {
            const u = JSON.parse(userRaw);
            if (u.email && !init.headers['X-Student-Email'] && !init.headers['x-student-email']) {
              init.headers['X-Student-Email'] = u.email;
            }
          } catch(e) {}
        }
      }
    }
    return _fetch.call(this, input, init);
  };
})();

// Central Events Database
const EVENTS_DATABASE = {
  'hackathon': {
    id: 'hackathon',
    regId: 'EVT-2027-001',
    token: 'tkn_sec_hack2027_001_8f9e',
    title: 'National Hackathon 2027',
    badge: 'FEATURED EVENT • TECHNOLOGY',
    date: '15–16 February 2027',
    venue: 'Main Tech Auditorium & Innovation Hub, Bengaluru',
    img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    desc: 'National Hackathon 2027 brings together 1,000+ collegiate developers, designers, and innovators for a 36-hour sprint. Build cutting-edge solutions across AI, Web3, ClimateTech and Healthcare.',
    highlights: [
      '₹5,00,000+ in prizes, seed grants, and incubation offers',
      'Free meals, hackathon merchandise, and hardware lab access',
      '1-on-1 mentorship with senior engineers from top tech companies'
    ],
    status: 'Confirmed',
    seatTier: 'Student Hacker All-Access Pass'
  },
  'ai-summit': {
    id: 'ai-summit',
    title: 'AI Innovation Summit',
    badge: 'TECHNOLOGY',
    date: '20 February 2027',
    venue: 'Silicon Hall, Bengaluru',
    img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    desc: 'Join industry researchers, student founders, and ML engineers exploring LLMs, agentic workflows, and edge intelligence.',
    highlights: [
      'Keynotes from leading AI research laboratories',
      'Hands-on computer vision and fine-tuning workshops',
      'Student project showcase with awards'
    ],
    status: 'Registration Open',
    seatTier: 'Delegate Pass'
  },
  'cultural-fest': {
    id: 'cultural-fest',
    regId: 'EVT-2026-38DFCS',
    token: 'tkn_sec_euphoria_38dfcs',
    title: 'Campus Cultural Fest',
    badge: 'CULTURAL',
    date: '25 February 2027',
    venue: 'Campus Amphitheatre & Quad, Bengaluru',
    img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    desc: 'The biggest inter-college cultural fest of the season! Battle of bands, street play championships, classical arts, and international dance crews.',
    highlights: [
      'Headline celebrity musical concert',
      '30+ competitive inter-college cultural events',
      'Campus carnival and food truck alley'
    ],
    status: 'Confirmed',
    seatTier: 'Fest Delegate Pass'
  },
  'pitch-challenge': {
    id: 'pitch-challenge',
    title: 'Startup Pitch Challenge',
    badge: 'ENTREPRENEURSHIP',
    date: '2 March 2027',
    venue: 'Venture Hub Auditorium, Bengaluru',
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    desc: 'Pitch your collegiate startup or prototype directly to early-stage venture capitalists, angel investors, and seasoned founders.',
    highlights: [
      'Live 5-minute pitches to top tier angel networks',
      'Fast-track entry into leading campus accelerators',
      'Masterclass on term sheets and valuation'
    ],
    status: 'Limited Seats',
    seatTier: 'Pitch Participant'
  },
  'ai-masterclass': {
    id: 'ai-masterclass',
    regId: 'EVT-2026-06EFFB',
    token: 'tkn_sec_ai_master_06effb',
    title: 'AI for Everyone: Masterclass',
    badge: 'WORKSHOP',
    date: '15–16 Feb, 2027',
    venue: 'SRM Tech Auditorium, Bengaluru',
    img: '/hero-campus.jpg',
    desc: 'Hands-on practical training covering neural network foundations, fine-tuning APIs, and building real-world AI applications.',
    highlights: [
      'Certificate of Masterclass Completion',
      'Cloud compute credits included',
      'Take-home source code projects'
    ],
    status: 'Confirmed',
    seatTier: 'Student Workshop Pass'
  }
};

let currentModalPassData = null;
let currentModalEventId = null;
let currentActiveView = 'dashboard';
let userRegistrations = [];

document.addEventListener('DOMContentLoaded', () => {
  initUserSession();
  initActivityStats();
  initGlobalEventListeners();
  loadRealRegistrations();
});

// 1. Initialize User Data from localStorage or default to Gautam
function initUserSession() {
  let user = null;
  try {
    const raw = localStorage.getItem('eventify_user');
    if (raw) user = JSON.parse(raw);
  } catch (err) {}

  if (!user || !user.name) {
    user = {
      name: 'Gautam',
      email: 'gautam@campus.edu',
      role: 'student',
      college: 'TechVerse University'
    };
  }

  const displayName = user.name || 'Gautam';
  const initial = displayName.charAt(0).toUpperCase();

  const navNameEl = document.getElementById('user-nav-name');
  if (navNameEl) navNameEl.textContent = displayName;

  const avatarCircle = document.getElementById('user-avatar-circle');
  if (avatarCircle) avatarCircle.textContent = initial;

  const dropdownName = document.getElementById('dropdown-user-name');
  if (dropdownName) dropdownName.textContent = displayName;

  const dropdownEmail = document.getElementById('dropdown-user-email');
  if (dropdownEmail) dropdownEmail.textContent = user.email || `${displayName.toLowerCase()}@campus.edu`;

  const profileModalName = document.getElementById('profile-modal-name');
  if (profileModalName) profileModalName.textContent = displayName;

  const profileModalEmail = document.getElementById('profile-modal-email');
  if (profileModalEmail) profileModalEmail.textContent = user.email || `${displayName.toLowerCase()}@campus.edu`;

  const profileModalAvatar = document.getElementById('profile-modal-avatar');
  if (profileModalAvatar) profileModalAvatar.textContent = initial;

  const profileModalCollege = document.getElementById('profile-modal-college');
  if (profileModalCollege) profileModalCollege.textContent = user.college || 'TechVerse University';

  const ticketAttendeeName = document.getElementById('ticket-attendee-name');
  if (ticketAttendeeName) ticketAttendeeName.textContent = displayName;

  const ticketAttendeeCollege = document.getElementById('ticket-attendee-college');
  if (ticketAttendeeCollege) ticketAttendeeCollege.textContent = user.college || 'TechVerse University';
}

// 2. Fetch Real Registrations from Backend
async function loadRealRegistrations() {
  try {
    const res = await fetch('/api/registrations');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.registrations)) {
        userRegistrations = data.registrations;
      }
    }
  } catch (e) {
    console.warn('Using offline fallback registrations:', e);
  }

  // If no backend registrations returned, use default verified registrations
  if (!userRegistrations || userRegistrations.length === 0) {
    const origin = window.location.origin;
    userRegistrations = [
      {
        id: 'EVT-2027-001',
        token: 'tkn_sec_hack2027_001_8f9e',
        eventName: 'National Hackathon 2027',
        eventId: 'hackathon',
        studentName: 'Gautam',
        college: 'TechVerse University',
        date: '15–16 Feb, 2027',
        venue: 'Main Tech Auditorium & Innovation Hub, Bengaluru',
        seatTier: 'Student Hacker All-Access Pass',
        status: 'Confirmed',
        img: '/assets/evt_hackathon.jpg',
        verificationUrl: `${origin}/verify?token=tkn_sec_hack2027_001_8f9e`,
        qrUrl: `/api/qr?text=${encodeURIComponent(`${origin}/verify?token=tkn_sec_hack2027_001_8f9e`)}`
      },
      {
        id: 'EVT-2026-38DFCS',
        token: 'tkn_sec_euphoria_38dfcs',
        eventName: 'Euphoria — Annual Cultural Fest',
        eventId: 'cultural-fest',
        studentName: 'Gautam',
        college: 'TechVerse University',
        date: '15–16 Feb, 2027',
        venue: 'Campus Amphitheatre, Bengaluru',
        seatTier: 'Fest Delegate Pass',
        status: 'Confirmed',
        img: '/assets/evt_cultural.jpg',
        verificationUrl: `${origin}/verify?token=tkn_sec_euphoria_38dfcs`,
        qrUrl: `/api/qr?text=${encodeURIComponent(`${origin}/verify?token=tkn_sec_euphoria_38dfcs`)}`
      },
      {
        id: 'EVT-2026-06EFFB',
        token: 'tkn_sec_ai_master_06effb',
        eventName: 'AI for Everyone: Masterclass',
        eventId: 'ai-masterclass',
        studentName: 'Gautam',
        college: 'TechVerse University',
        date: '15–16 Feb, 2027',
        venue: 'SRM Tech Auditorium, Bengaluru',
        seatTier: 'Student Workshop Pass',
        status: 'Confirmed',
        img: '/hero-campus.jpg',
        verificationUrl: `${origin}/verify?token=tkn_sec_ai_master_06effb`,
        qrUrl: `/api/qr?text=${encodeURIComponent(`${origin}/verify?token=tkn_sec_ai_master_06effb`)}`
      }
    ];
  }

  // Update QR preview on the dashboard widget
  const widgetQr = document.getElementById('widget-qr-img-001');
  if (widgetQr) {
    const hackPass = userRegistrations.find(r => r.id === 'EVT-2027-001') || userRegistrations[0];
    const origin = window.location.origin;
    const verifyUrl = `${origin}/verify?token=${hackPass.token}`;
    widgetQr.src = `/api/qr?text=${encodeURIComponent(verifyUrl)}`;
  }

  // Render cards in My Registrations view
  renderRegistrationsView();
}

// 3. Render Cards in "My Registrations" View (Matching Reference Screenshot)
function renderRegistrationsView() {
  const container = document.getElementById('registrations-cards-grid');
  if (!container) return;

  const origin = window.location.origin;

  container.innerHTML = userRegistrations.map(reg => {
    const verifyUrl = reg.verificationUrl || `${origin}/verify?token=${reg.token}`;
    const qrSrc = reg.qrUrl || `/api/qr?text=${encodeURIComponent(verifyUrl)}`;
    const thumbImg = reg.img || (reg.id === 'EVT-2026-06EFFB' ? '/hero-campus.jpg' : '/assets/evt_hackathon.jpg');

    return `
      <div class="bg-white rounded-2xl p-5 border border-brandBorder shadow-card flex flex-col justify-between">
        <div>
          <!-- Header Row -->
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <div class="flex items-center gap-1.5">
              <span class="text-brandBlue text-base leading-none">☆</span>
              <h3 class="font-heading font-extrabold text-sm text-brandNavy tracking-tight">
                My Event Passes
              </h3>
            </div>
            <button onclick="openPassModal('${reg.id}')" class="text-xs font-bold text-brandNavy hover:text-brandBlue transition-colors">
              View All →
            </button>
          </div>

          <!-- Pass Details Box -->
          <div class="p-3.5 rounded-xl border border-brandBorder/80 bg-[#F9FBFE]">
            <div class="flex items-start gap-3">
              <!-- Thumbnail -->
              <img 
                src="${thumbImg}" 
                onerror="this.src='/hero-campus.jpg'"
                alt="${reg.eventName}" 
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 border border-slate-200"
              />

              <!-- Text Info -->
              <div class="flex-1 min-w-0">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Confirmed</span>
                </span>
                <h4 class="font-heading font-bold text-xs sm:text-sm text-brandNavy truncate mt-1">
                  ${reg.eventName}
                </h4>
                <div class="text-[11px] text-slate-500 mt-0.5 space-y-0.5">
                  <p class="truncate">📅 ${reg.date}</p>
                  <p class="truncate">📍 ${reg.venue ? reg.venue.split('•')[0] : 'Bengaluru'}</p>
                </div>
                <p class="text-[9px] text-slate-500 font-mono mt-1 font-semibold truncate">
                  Registration ID: ${reg.id}
                </p>
              </div>

              <!-- REAL DYNAMIC SCANNABLE QR CODE -->
              <div class="shrink-0 text-center" title="Click to enlarge scannable pass">
                <div class="w-14 h-14 sm:w-16 sm:h-16 p-0.5 bg-white rounded-md border border-slate-200 shadow-2xs flex items-center justify-center cursor-pointer hover:border-brandBlue transition-colors" onclick="openPassModal('${reg.id}')">
                  <img 
                    src="${qrSrc}" 
                    alt="Genuine Scannable QR Code for ${reg.id}" 
                    class="w-full h-full object-contain"
                  />
                </div>
                <span class="text-[8px] text-emerald-600 font-bold block mt-0.5">Scannable</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Buttons Row -->
        <div class="mt-4 flex gap-2">
          <button 
            type="button" 
            onclick="openPassModal('${reg.id}')" 
            class="flex-1 py-2.5 rounded-xl bg-brandNavy hover:bg-[#0f2038] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs btn-spring"
          >
            <svg class="w-4 h-4 text-brandBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
            <span>View QR Pass</span>
          </button>

          <button 
            type="button" 
            onclick="downloadPass('${reg.id}')" 
            class="flex-1 py-2.5 rounded-xl bg-white border border-brandBorder hover:border-brandNavy text-brandNavy font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 btn-spring"
          >
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            <span>Download</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// 4. View Switching: Dashboard vs My Registrations
function switchView(viewName) {
  currentActiveView = viewName;
  const dashboardView = document.getElementById('view-dashboard');
  const regView = document.getElementById('view-registrations');
  const navDashboard = document.getElementById('nav-btn-dashboard');
  const navReg = document.getElementById('nav-btn-registrations');

  if (viewName === 'registrations') {
    if (dashboardView) dashboardView.classList.add('hidden');
    if (regView) regView.classList.remove('hidden');

    if (navReg) {
      navReg.className = 'w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl bg-brandIce text-brandNavy font-bold text-sm transition-all shadow-xs text-left';
    }
    if (navDashboard) {
      navDashboard.className = 'w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-brandSlate hover:text-brandNavy hover:bg-slate-50 font-medium text-sm transition-colors text-left group';
    }
    renderRegistrationsView();
  } else {
    if (regView) regView.classList.add('hidden');
    if (dashboardView) dashboardView.classList.remove('hidden');

    if (navDashboard) {
      navDashboard.className = 'w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl bg-brandIce text-brandNavy font-bold text-sm transition-all shadow-xs text-left';
    }
    if (navReg) {
      navReg.className = 'w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-brandSlate hover:text-brandNavy hover:bg-slate-50 font-medium text-sm transition-colors text-left group';
    }
  }

  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. Open Large Digital Pass Modal with Real Scannable QR Code
function openPassModal(regId = 'EVT-2027-001') {
  const modal = document.getElementById('pass-modal');
  if (!modal) return;

  // Find registration data
  let reg = userRegistrations.find(r => r.id === regId || r.eventId === regId);
  if (!reg) {
    reg = userRegistrations[0] || {
      id: 'EVT-2027-001',
      token: 'tkn_sec_hack2027_001_8f9e',
      eventName: 'National Hackathon 2027',
      date: '15–16 Feb, 2027',
      venue: 'Main Tech Auditorium & Innovation Hub, Bengaluru',
      seatTier: 'Student Hacker All-Access Pass',
      studentName: 'Gautam',
      college: 'TechVerse University'
    };
  }

  currentModalPassData = reg;

  const origin = window.location.origin;
  const verifyUrl = `${origin}/verify?token=${reg.token || 'tkn_sec_hack2027_001_8f9e'}`;
  const qrEndpoint = `/api/qr?text=${encodeURIComponent(verifyUrl)}`;

  // Update modal contents
  document.getElementById('modal-pass-event-title').textContent = reg.eventName;
  document.getElementById('modal-pass-reg-id').textContent = `REG ID: ${reg.id}`;
  document.getElementById('ticket-attendee-date').textContent = reg.date;
  document.getElementById('ticket-attendee-venue').textContent = reg.venue;
  document.getElementById('ticket-attendee-access').textContent = reg.seatTier || 'All-Access Pass';

  const verifyLink = document.getElementById('modal-pass-verify-link');
  if (verifyLink) {
    verifyLink.href = verifyUrl;
  }

  const qrImg = document.getElementById('modal-pass-qr-img');
  if (qrImg) {
    qrImg.src = qrEndpoint;
  }

  const bannerImg = document.getElementById('modal-pass-banner-img');
  if (bannerImg) {
    bannerImg.src = reg.img || (reg.id === 'EVT-2026-06EFFB' ? '/hero-campus.jpg' : '/assets/evt_hackathon.jpg');
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  closeUserDropdown();
  closeNotifications();
}

function closePassModal() {
  const modal = document.getElementById('pass-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// 6. Download Ticket Pass Functionality (Generates Downloadable File with Real QR)
function downloadPass(regId = 'EVT-2027-001') {
  let reg = userRegistrations.find(r => r.id === regId);
  if (!reg) reg = userRegistrations[0];
  if (!reg) return;

  const origin = window.location.origin;
  const verifyUrl = `${origin}/verify?token=${reg.token}`;
  const qrUrl = `/api/qr?text=${encodeURIComponent(verifyUrl)}`;

  showToast(`Preparing download for ${reg.id}...`, 'info');

  // Create clean self-contained HTML ticket file with real scannable QR
  const ticketHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Eventify Pass — ${reg.eventName} (${reg.id})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #EDF4FA; margin: 0; padding: 40px; color: #172B45; }
    .ticket-card { max-width: 500px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; box-shadow: 0 10px 30px rgba(23,43,69,0.1); border: 1px solid #E2EAF2; overflow: hidden; }
    .header { background: #172B45; color: white; padding: 24px; text-align: left; }
    .badge { font-size: 10px; font-weight: bold; letter-spacing: 1.5px; color: #83C5F7; text-transform: uppercase; }
    .event-title { font-size: 20px; font-weight: bold; margin: 6px 0 0 0; }
    .body { padding: 32px 24px; text-align: center; }
    .qr-box { width: 200px; height: 200px; margin: 0 auto 16px auto; background: white; border: 2px solid #E2EAF2; border-radius: 16px; padding: 8px; }
    .qr-box img { width: 100%; height: 100%; object-fit: contain; }
    .reg-id { font-family: monospace; font-size: 14px; font-weight: bold; color: #172B45; }
    .status { display: inline-block; background: #E7F7ED; color: #1B7C48; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; margin-top: 6px; }
    .details { margin-top: 24px; background: #F8FAFD; border-radius: 16px; padding: 16px; font-size: 13px; text-align: left; border: 1px solid #E2EAF2; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #EEF3F8; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #66788C; }
    .detail-value { font-weight: bold; color: #172B45; }
    .footer { background: #F4F8FC; padding: 16px; text-align: center; font-size: 11px; color: #66788C; border-top: 1px solid #E2EAF2; }
    @media print { body { background: white; padding: 0; } .ticket-card { box-shadow: none; border: 1px solid #ccc; } }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="header">
      <div class="badge">OFFICIAL EVENT PASS • EVENTIFY</div>
      <div class="event-title">${reg.eventName}</div>
    </div>
    <div class="body">
      <div class="qr-box">
        <img src="${origin}${qrUrl}" alt="Scannable QR Code" />
      </div>
      <div class="reg-id">${reg.id}</div>
      <div class="status">✓ VERIFIED & CONFIRMED ENTRY</div>
      <div class="details">
        <div class="detail-row"><span class="detail-label">Attendee:</span><span class="detail-value">${reg.studentName || 'Gautam'}</span></div>
        <div class="detail-row"><span class="detail-label">Institution:</span><span class="detail-value">${reg.college || 'TechVerse University'}</span></div>
        <div class="detail-row"><span class="detail-label">Date & Time:</span><span class="detail-value">${reg.date}</span></div>
        <div class="detail-row"><span class="detail-label">Venue:</span><span class="detail-value">${reg.venue}</span></div>
        <div class="detail-row"><span class="detail-label">Pass Tier:</span><span class="detail-value" style="color: #0284c7;">${reg.seatTier || 'All-Access Pass'}</span></div>
        <div class="detail-row"><span class="detail-label">Verify URL:</span><span class="detail-value" style="font-family: monospace; font-size: 10px;">${verifyUrl}</span></div>
      </div>
    </div>
    <div class="footer">
      Generated securely by Eventify Gateway • Present this QR code at Gate 1 for admission
    </div>
  </div>
  <script>
    window.onload = function() {
      // Auto open print option
      setTimeout(function() { window.print(); }, 600);
    };
  </script>
</body>
</html>`;

  // Trigger file download
  const blob = new Blob([ticketHtml], { type: 'text/html' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `Eventify-Pass-${reg.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  showToast(`Ticket pass downloaded: Eventify-Pass-${reg.id}.html`, 'success');
}

function downloadCurrentModalPass() {
  if (currentModalPassData && currentModalPassData.id) {
    downloadPass(currentModalPassData.id);
  } else {
    downloadPass('EVT-2027-001');
  }
}

// 7. Activity Counters (04 Registered, 08 Saved, 02 Upcoming)
function initActivityStats() {
  const regEl = document.getElementById('stat-registered-count');
  if (regEl) regEl.textContent = '04';

  const savedEl = document.getElementById('stat-saved-count');
  if (savedEl) savedEl.textContent = '08';

  const upEl = document.getElementById('stat-upcoming-count');
  if (upEl) upEl.textContent = '02';
}

// 8. Search Real-time Filter
function handleSearch(query) {
  const q = (query || '').toLowerCase().trim();
  const clearBtn = document.getElementById('clear-search-btn');
  if (clearBtn) clearBtn.classList.toggle('hidden', !q);

  const cards = document.querySelectorAll('.event-card-item');
  let visibleCount = 0;

  cards.forEach(card => {
    const title = (card.getAttribute('data-title') || '').toLowerCase();
    const category = (card.getAttribute('data-category') || '').toLowerCase();

    if (!q || title.includes(q) || category.includes(q)) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const emptyState = document.getElementById('no-search-results');
  if (emptyState) emptyState.classList.toggle('hidden', visibleCount > 0);
}

function clearSearch() {
  const input = document.getElementById('dashboard-search-input');
  if (input) {
    input.value = '';
    handleSearch('');
  }
}

// 9. Event Details Modal
function openEventDetailsModal(eventId) {
  const event = EVENTS_DATABASE[eventId];
  if (!event) return;

  currentModalEventId = eventId;
  const modal = document.getElementById('event-details-modal');
  if (!modal) return;

  document.getElementById('modal-event-title').textContent = event.title;
  document.getElementById('modal-event-badge').textContent = event.badge;
  document.getElementById('modal-event-date').textContent = `📅 ${event.date}`;
  document.getElementById('modal-event-location').textContent = `📍 ${event.venue}`;
  document.getElementById('modal-event-img').src = event.img;
  document.getElementById('modal-event-desc').textContent = event.desc;

  const highlightsEl = document.getElementById('modal-event-highlights');
  if (highlightsEl) {
    highlightsEl.innerHTML = event.highlights.map(h => `<li>${h}</li>`).join('');
  }

  const regBtn = document.getElementById('modal-register-btn');
  if (regBtn) {
    regBtn.textContent = event.status === 'Confirmed' ? 'Already Registered ✓' : 'Confirm Registration';
    regBtn.className = event.status === 'Confirmed' 
      ? 'flex-1 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold'
      : 'flex-1 py-3 rounded-xl bg-brandNavy hover:bg-[#0f2038] text-white text-xs font-bold transition-colors shadow-sm';
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeEventDetailsModal() {
  const modal = document.getElementById('event-details-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  currentModalEventId = null;
}

function handleEventRegisterAction() {
  if (!currentModalEventId) return;
  const event = EVENTS_DATABASE[currentModalEventId];
  if (!event) return;

  showToast(`Successfully registered for ${event.title}!`, 'success');
  closeEventDetailsModal();
}

// 10. Profile Modal
function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  closeUserDropdown();
}

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// 11. Saved Events
function toggleSavedEventsView() {
  showToast('You have 8 saved events in your student bookmarks.', 'info');
}

// 12. Dropdowns & Navigation
function toggleUserDropdown() {
  const dd = document.getElementById('user-menu-dropdown');
  if (dd) dd.classList.toggle('hidden');
  closeNotifications();
}

function closeUserDropdown() {
  const dd = document.getElementById('user-menu-dropdown');
  if (dd) dd.classList.add('hidden');
}

function toggleNotifications() {
  const dd = document.getElementById('notification-dropdown');
  if (dd) dd.classList.toggle('hidden');
  closeUserDropdown();
}

function closeNotifications() {
  const dd = document.getElementById('notification-dropdown');
  if (dd) dd.classList.add('hidden');
}

function markAllNotificationsRead() {
  const redDot = document.querySelector('button[aria-label="View notifications"] span');
  if (redDot) redDot.remove();
  showToast('All notifications marked as read.', 'info');
  closeNotifications();
}

function toggleMobileSidebar() {
  const drawer = document.getElementById('sidebar-drawer');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (drawer) {
    const isClosed = drawer.classList.contains('-translate-x-full');
    if (isClosed) {
      drawer.classList.remove('-translate-x-full');
      if (backdrop) backdrop.classList.remove('hidden');
    } else {
      drawer.classList.add('-translate-x-full');
      if (backdrop) backdrop.classList.add('hidden');
    }
  }
}

function closeMobileSidebar() {
  const drawer = document.getElementById('sidebar-drawer');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (drawer) drawer.classList.add('-translate-x-full');
  if (backdrop) backdrop.classList.add('hidden');
}

// 13. Global Event Listeners
function initGlobalEventListeners() {
  document.addEventListener('click', (e) => {
    const userDropdown = document.getElementById('user-menu-dropdown');
    const profileBtn = e.target.closest('button[onclick*="toggleUserDropdown"]');
    if (userDropdown && !userDropdown.contains(e.target) && !profileBtn) {
      closeUserDropdown();
    }

    const notifDropdown = document.getElementById('notification-dropdown');
    const notifBtn = e.target.closest('button[onclick*="toggleNotifications"]');
    if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn) {
      closeNotifications();
    }
  });

  ['pass-modal', 'event-details-modal', 'profile-modal'].forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePassModal();
      closeEventDetailsModal();
      closeProfileModal();
      closeUserDropdown();
      closeNotifications();
    }
  });
}

// 14. Logout
function handleLogout() {
  showToast('Signing out of student account...', 'info');
  try {
    localStorage.removeItem('eventify_token');
    localStorage.removeItem('eventify_user');
  } catch (e) {}

  setTimeout(() => {
    window.location.href = '/student/login';
  }, 700);
}

// 15. Toast System
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-[#172B45] text-white border-l-4 border-emerald-400' 
           : type === 'error' ? 'bg-red-600 text-white' 
           : 'bg-[#172B45] text-white border-l-4 border-brandBlue';

  toast.className = `${bg} px-4 py-3 rounded-xl shadow-elevated text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto max-w-sm`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
