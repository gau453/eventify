/**
 * EVENTIFY — Authentication Module Controller
 * Handles 6 separate authentication screens for Students & Organisers:
 * 1. /student/login
 * 2. /student/signup
 * 3. /student/forgot-password
 * 4. /organiser/login
 * 5. /organiser/signup
 * 6. /organiser/forgot-password
 */

const AUTH_CONFIGS = {
  'student-login': {
    route: '/student/login',
    role: 'student',
    type: 'login',
    left: {
      tag: 'DISCOVER YOUR CAMPUS',
      heading: 'Your next adventure starts here.',
      subtext: 'Discover exciting events, meet new people and make unforgettable campus memories.',
      bg: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      benefits: []
    },
    right: {
      eyebrow: 'STUDENT PORTAL',
      heading: 'Welcome back!',
      subtext: 'Sign in to discover events and manage your registrations.',
      submitText: 'Sign In',
      bottomNav: {
        text: "Don't have an account?",
        actionText: 'Sign Up',
        target: 'student-signup'
      }
    }
  },

  'student-signup': {
    route: '/student/signup',
    role: 'student',
    type: 'signup',
    left: {
      tag: 'DISCOVER YOUR CAMPUS',
      heading: 'Your next experience starts here.',
      subtext: 'Join Eventify and discover hackathons, college fests, workshops and opportunities waiting for you.',
      bg: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      benefits: []
    },
    right: {
      eyebrow: 'STUDENT PORTAL',
      heading: 'Create your student account',
      subtext: 'Join the community and start discovering exciting events.',
      submitText: 'Create Student Account',
      bottomNav: {
        text: 'Already have an account?',
        actionText: 'Sign In',
        target: 'student-login'
      }
    }
  },

  'student-forgot': {
    route: '/student/forgot-password',
    role: 'student',
    type: 'forgot',
    left: {
      tag: 'DISCOVER YOUR CAMPUS',
      heading: 'Never miss campus life.',
      subtext: 'Regain access to your registrations, tickets and upcoming fests in seconds.',
      bg: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      benefits: []
    },
    right: {
      eyebrow: 'STUDENT PORTAL',
      heading: 'Reset your password',
      subtext: "Don't worry! Enter your registered email address and we'll send you a password reset link.",
      submitText: 'Send Reset Link',
      bottomNav: {
        text: 'Remembered your password?',
        actionText: 'Back to Student Login',
        target: 'student-login'
      }
    }
  },

  'organiser-login': {
    route: '/organiser/login',
    role: 'organiser',
    type: 'login',
    left: {
      tag: 'ORGANISER PORTAL',
      heading: 'Your events. Your community. Your impact.',
      subtext: 'Manage events, connect with attendees and bring your ideas to life.',
      bg: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      benefits: [
        'Create and publish events effortlessly.',
        'Manage registrations and digital check-ins.',
        'Track event performance with live rosters.'
      ]
    },
    right: {
      eyebrow: 'ORGANISER PORTAL',
      heading: 'Welcome back, organiser.',
      subtext: 'Log in to manage your events and registrations.',
      submitText: 'Sign In as Organiser',
      bottomNav: {
        text: 'New to Eventify?',
        actionText: 'Create an organiser account',
        target: 'organiser-signup'
      }
    }
  },

  'organiser-signup': {
    route: '/organiser/signup',
    role: 'organiser',
    type: 'signup',
    left: {
      tag: 'ORGANISER PORTAL',
      heading: 'Start hosting with Eventify.',
      subtext: 'Everything you need to create, organise and manage successful events.',
      bg: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      benefits: [
        'Publish your events in under 2 minutes.',
        'Reach 12,000+ active student communities.',
        'Automated digital QR tickets & gate attendance.'
      ]
    },
    right: {
      eyebrow: 'ORGANISER PORTAL',
      heading: 'Bring your events to life.',
      subtext: 'Create your organiser account and start hosting events.',
      submitText: 'Create Organiser Account',
      bottomNav: {
        text: 'Already an organiser?',
        actionText: 'Sign In',
        target: 'organiser-login'
      }
    }
  },

  'organiser-forgot': {
    route: '/organiser/forgot-password',
    role: 'organiser',
    type: 'forgot',
    left: {
      tag: 'ORGANISER PORTAL',
      heading: 'Empowering campus leaders.',
      subtext: 'Recover your organiser access and keep your events running smoothly.',
      bg: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      benefits: [
        'Instant password reset link sent to registered email.',
        'Preserves all active event registrations and data.',
        'Dedicated 24/7 organizer priority assistance.'
      ]
    },
    right: {
      eyebrow: 'ORGANISER PORTAL',
      heading: 'Reset your password',
      subtext: 'Enter your registered organisation email to receive password reset instructions.',
      submitText: 'Send Reset Link',
      bottomNav: {
        text: 'Remembered your password?',
        actionText: 'Back to Organiser Login',
        target: 'organiser-login'
      }
    }
  }
};

class AuthApp {
  constructor() {
    this.currentScreenKey = this.resolveInitialScreen();
    this.initElements();
    this.bindEvents();
    this.renderScreen(this.currentScreenKey, false);
  }

  resolveInitialScreen() {
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    const hash = (window.location.hash || '').toLowerCase().replace(/^#/, '');
    const params = new URLSearchParams(window.location.search);
    const routeParam = params.get('route') || '';

    const candidate = path || hash || routeParam;

    if (candidate.includes('student/signup')) return 'student-signup';
    if (candidate.includes('student/forgot')) return 'student-forgot';
    if (candidate.includes('student/login')) return 'student-login';
    if (candidate.includes('organiser/signup') || candidate.includes('organizer/signup')) return 'organiser-signup';
    if (candidate.includes('organiser/forgot') || candidate.includes('organizer/forgot')) return 'organiser-forgot';
    if (candidate.includes('organiser/login') || candidate.includes('organizer/login')) return 'organiser-login';

    // Default to student login
    return 'student-login';
  }

  initElements() {
    // Left panel elements
    this.leftBg = document.getElementById('auth-left-bg');
    this.leftTag = document.getElementById('auth-left-tag');
    this.leftHeading = document.getElementById('auth-left-heading');
    this.leftSubtext = document.getElementById('auth-left-subtext');
    this.leftBenefits = document.getElementById('auth-left-benefits');

    // Right panel elements
    this.roleBtnStudent = document.getElementById('role-btn-student');
    this.roleBtnOrganiser = document.getElementById('role-btn-organiser');
    this.formEyebrow = document.getElementById('form-eyebrow');
    this.formHeading = document.getElementById('form-heading');
    this.formSubtext = document.getElementById('form-subtext');
    this.formAlert = document.getElementById('form-alert');
    this.authForm = document.getElementById('auth-form');
    this.formFields = document.getElementById('form-fields');
    this.submitBtn = document.getElementById('form-submit-btn');
    this.submitBtnText = document.getElementById('submit-btn-text');
    this.formConfirmation = document.getElementById('form-confirmation');
    this.confirmBackBtn = document.getElementById('confirm-back-btn');
    this.confirmSubtext = document.getElementById('confirm-subtext');
    this.bottomNavText = document.getElementById('bottom-nav-text');
    this.bottomNavLink = document.getElementById('bottom-nav-link');
  }

  bindEvents() {
    // Role switcher pills
    if (this.roleBtnStudent) {
      this.roleBtnStudent.addEventListener('click', () => {
        this.switchRole('student');
      });
    }

    if (this.roleBtnOrganiser) {
      this.roleBtnOrganiser.addEventListener('click', () => {
        this.switchRole('organiser');
      });
    }

    // Bottom nav link navigation
    if (this.bottomNavLink) {
      this.bottomNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = this.bottomNavLink.getAttribute('data-target');
        if (target && AUTH_CONFIGS[target]) {
          this.navigateTo(target);
        }
      });
    }

    // Confirmation screen back button
    if (this.confirmBackBtn) {
      this.confirmBackBtn.addEventListener('click', () => {
        const config = AUTH_CONFIGS[this.currentScreenKey];
        const target = config.role === 'organiser' ? 'organiser-login' : 'student-login';
        this.navigateTo(target);
      });
    }

    // Form submit
    if (this.authForm) {
      this.authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    // Browser back / forward buttons
    window.addEventListener('popstate', () => {
      const key = this.resolveInitialScreen();
      this.renderScreen(key, false);
    });
  }

  switchRole(targetRole) {
    const current = AUTH_CONFIGS[this.currentScreenKey];
    if (current.role === targetRole) return;

    let nextKey = 'student-login';
    if (targetRole === 'organiser') {
      if (current.type === 'signup') nextKey = 'organiser-signup';
      else if (current.type === 'forgot') nextKey = 'organiser-forgot';
      else nextKey = 'organiser-login';
    } else {
      if (current.type === 'signup') nextKey = 'student-signup';
      else if (current.type === 'forgot') nextKey = 'student-forgot';
      else nextKey = 'student-login';
    }

    this.navigateTo(nextKey);
  }

  navigateTo(screenKey) {
    if (!AUTH_CONFIGS[screenKey]) return;
    this.currentScreenKey = screenKey;
    const config = AUTH_CONFIGS[screenKey];

    // Push state without page reload
    if (window.history && window.history.pushState) {
      window.history.pushState({ screenKey }, '', config.route);
    }

    this.renderScreen(screenKey);
  }

  renderScreen(screenKey, animate = true) {
    const config = AUTH_CONFIGS[screenKey];
    if (!config) return;
    this.currentScreenKey = screenKey;

    this.clearAlert();
    this.formConfirmation.classList.add('hidden');
    this.authForm.classList.remove('hidden');

    // 1. Update Left Panel
    this.leftBg.src = config.left.bg;
    this.leftTag.textContent = config.left.tag;
    this.leftHeading.textContent = config.left.heading;
    this.leftSubtext.textContent = config.left.subtext;

    // Benefit highlights
    if (config.left.benefits && config.left.benefits.length > 0) {
      this.leftBenefits.innerHTML = config.left.benefits.map(b => `
        <div class="flex items-center gap-2.5 text-xs sm:text-sm text-white/90 font-medium">
          <span class="w-5 h-5 rounded-full bg-[#83C5F7]/30 text-[#83C5F7] flex items-center justify-center font-bold text-xs flex-shrink-0">✓</span>
          <span>${b}</span>
        </div>
      `).join('');
      this.leftBenefits.classList.remove('hidden');
    } else {
      this.leftBenefits.classList.add('hidden');
    }

    // 2. Update Segmented Role Switcher
    if (config.role === 'student') {
      this.roleBtnStudent.className = 'px-5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs bg-white text-[#183153]';
      this.roleBtnStudent.setAttribute('aria-selected', 'true');
      this.roleBtnOrganiser.className = 'px-5 py-1.5 rounded-full text-xs font-bold transition-all text-[#66788C] hover:text-[#183153]';
      this.roleBtnOrganiser.setAttribute('aria-selected', 'false');
    } else {
      this.roleBtnStudent.className = 'px-5 py-1.5 rounded-full text-xs font-bold transition-all text-[#66788C] hover:text-[#183153]';
      this.roleBtnStudent.setAttribute('aria-selected', 'false');
      this.roleBtnOrganiser.className = 'px-5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs bg-white text-[#183153]';
      this.roleBtnOrganiser.setAttribute('aria-selected', 'true');
    }

    // 3. Update Card Header
    this.formEyebrow.textContent = config.right.eyebrow;
    this.formHeading.textContent = config.right.heading;
    this.formSubtext.textContent = config.right.subtext;
    this.submitBtnText.textContent = config.right.submitText;

    // 4. Update Bottom Navigation Link
    this.bottomNavText.textContent = config.right.bottomNav.text;
    this.bottomNavLink.textContent = config.right.bottomNav.actionText;
    this.bottomNavLink.setAttribute('data-target', config.right.bottomNav.target);
    this.bottomNavLink.href = AUTH_CONFIGS[config.right.bottomNav.target].route;

    // 5. Render Dynamic Fields
    this.renderFields(config);
  }

  renderFields(config) {
    let html = '';

    if (config.type === 'login') {
      const isOrg = config.role === 'organiser';
      html = `
        <div>
          <label class="block text-xs font-bold text-[#183153] mb-1.5">
            ${isOrg ? 'Organisation Email' : 'Email Address'}
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66788C]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
            </span>
            <input 
              type="email" 
              id="field-email" 
              required
              placeholder="${isOrg ? 'club@campus.edu' : 'you@university.edu'}"
              value="${isOrg ? 'organiser@campus.edu' : 'student@campus.edu'}"
              class="w-full h-[52px] pl-10 pr-3.5 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs sm:text-sm font-medium text-[#183153] focus:outline-none transition-all placeholder-[#66788C]/60"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#183153] mb-1.5">
            Password
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66788C]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </span>
            <input 
              type="password" 
              id="field-password" 
              required
              placeholder="Enter your password"
              value="password123"
              class="w-full h-[52px] pl-10 pr-10 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs sm:text-sm font-medium text-[#183153] focus:outline-none transition-all placeholder-[#66788C]/60"
            />
            <button 
              type="button" 
              onclick="window.authApp.togglePassword('field-password', this)"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#66788C] hover:text-[#183153]"
              aria-label="Toggle password visibility"
            >
              <svg class="w-4 h-4 eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs pt-1">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              id="field-remember" 
              checked
              class="w-4 h-4 rounded text-[#83C5F7] focus:ring-[#83C5F7] border-[#E4ECF3]"
            />
            <span class="text-[#66788C] font-medium">Remember me</span>
          </label>

          <a 
            href="${isOrg ? '/organiser/forgot-password' : '/student/forgot-password'}" 
            onclick="event.preventDefault(); window.authApp.navigateTo('${isOrg ? 'organiser-forgot' : 'student-forgot'}');"
            class="text-[#83C5F7] hover:underline font-semibold"
          >
            Forgot password?
          </a>
        </div>
      `;
    } else if (config.type === 'signup') {
      const isOrg = config.role === 'organiser';
      if (!isOrg) {
        // Student Sign Up
        html = `
          <div>
            <label class="block text-xs font-bold text-[#183153] mb-1.5">Full Name</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66788C]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </span>
              <input type="text" id="field-name" required placeholder="Alex Johnson" class="w-full h-[52px] pl-10 pr-3.5 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs sm:text-sm font-medium text-[#183153] focus:outline-none transition-all placeholder-[#66788C]/60" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#183153] mb-1.5">College / University</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66788C]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </span>
              <input type="text" id="field-college" required placeholder="e.g. TechVerse University" class="w-full h-[52px] pl-10 pr-3.5 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs sm:text-sm font-medium text-[#183153] focus:outline-none transition-all placeholder-[#66788C]/60" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#183153] mb-1.5">Email Address</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66788C]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
              </span>
              <input type="email" id="field-email" required placeholder="alex@university.edu" class="w-full h-[52px] pl-10 pr-3.5 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs sm:text-sm font-medium text-[#183153] focus:outline-none transition-all placeholder-[#66788C]/60" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#183153] mb-1.5">Password</label>
              <div class="relative">
                <input type="password" id="field-password" required placeholder="Min 8 chars" class="w-full h-[52px] px-3.5 pr-9 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs font-medium text-[#183153] focus:outline-none transition-all" />
                <button type="button" onclick="window.authApp.togglePassword('field-password', this)" class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#66788C]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#183153] mb-1.5">Confirm</label>
              <div class="relative">
                <input type="password" id="field-confirm-password" required placeholder="Re-enter" class="w-full h-[52px] px-3.5 pr-9 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs font-medium text-[#183153] focus:outline-none transition-all" />
                <button type="button" onclick="window.authApp.togglePassword('field-confirm-password', this)" class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#66788C]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="pt-1">
            <label class="flex items-start gap-2.5 cursor-pointer text-xs text-[#66788C]">
              <input type="checkbox" id="field-terms" required checked class="mt-0.5 w-4 h-4 rounded text-[#83C5F7] focus:ring-[#83C5F7] border-[#E4ECF3]" />
              <span>I agree to the <a href="#" class="text-[#83C5F7] font-semibold hover:underline">Terms of Service</a> and <a href="#" class="text-[#83C5F7] font-semibold hover:underline">Privacy Policy</a>.</span>
            </label>
          </div>
        `;
      } else {
        // Organiser Sign Up
        html = `
          <div>
            <label class="block text-xs font-bold text-[#183153] mb-1.5">Organisation / Club Name</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66788C]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </span>
              <input type="text" id="field-org" required placeholder="e.g. MIT GDSC Chapter / Cultural Council" class="w-full h-[52px] pl-10 pr-3.5 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs sm:text-sm font-medium text-[#183153] focus:outline-none transition-all placeholder-[#66788C]/60" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#183153] mb-1.5">Contact Person's Name</label>
              <input type="text" id="field-name" required placeholder="Sarah Chen" class="w-full h-[52px] px-3.5 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs font-medium text-[#183153] focus:outline-none transition-all" />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#183153] mb-1.5">Phone Number</label>
              <input type="tel" id="field-phone" required placeholder="+1 (555) 000-0000" class="w-full h-[52px] px-3.5 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs font-medium text-[#183153] focus:outline-none transition-all" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#183153] mb-1.5">Organisation Email</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66788C]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
              </span>
              <input type="email" id="field-email" required placeholder="club.lead@campus.edu" class="w-full h-[52px] pl-10 pr-3.5 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs sm:text-sm font-medium text-[#183153] focus:outline-none transition-all placeholder-[#66788C]/60" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#183153] mb-1.5">Password</label>
              <div class="relative">
                <input type="password" id="field-password" required placeholder="Min 8 chars" class="w-full h-[52px] px-3.5 pr-9 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs font-medium text-[#183153] focus:outline-none transition-all" />
                <button type="button" onclick="window.authApp.togglePassword('field-password', this)" class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#66788C]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#183153] mb-1.5">Confirm</label>
              <div class="relative">
                <input type="password" id="field-confirm-password" required placeholder="Re-enter" class="w-full h-[52px] px-3.5 pr-9 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs font-medium text-[#183153] focus:outline-none transition-all" />
                <button type="button" onclick="window.authApp.togglePassword('field-confirm-password', this)" class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#66788C]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="pt-1">
            <label class="flex items-start gap-2.5 cursor-pointer text-xs text-[#66788C]">
              <input type="checkbox" id="field-terms" required checked class="mt-0.5 w-4 h-4 rounded text-[#83C5F7] focus:ring-[#83C5F7] border-[#E4ECF3]" />
              <span>I agree to the <a href="#" class="text-[#83C5F7] font-semibold hover:underline">Organiser Terms of Service</a> and <a href="#" class="text-[#83C5F7] font-semibold hover:underline">Privacy Policy</a>.</span>
            </label>
          </div>
        `;
      }
    } else if (config.type === 'forgot') {
      const isOrg = config.role === 'organiser';
      html = `
        <div>
          <label class="block text-xs font-bold text-[#183153] mb-1.5">
            ${isOrg ? 'Organisation Email' : 'Email Address'}
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66788C]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
            </span>
            <input 
              type="email" 
              id="field-email" 
              required
              placeholder="${isOrg ? 'club@campus.edu' : 'you@university.edu'}"
              class="w-full h-[52px] pl-10 pr-3.5 rounded-[10px] bg-white border border-[#E4ECF3] focus:border-[#83C5F7] focus:ring-2 focus:ring-[#83C5F7]/25 text-xs sm:text-sm font-medium text-[#183153] focus:outline-none transition-all placeholder-[#66788C]/60"
            />
          </div>
        </div>
      `;
    }

    this.formFields.innerHTML = html;
  }

  togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    btn.innerHTML = isPassword 
      ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>`
      : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
  }

  async handleFormSubmit() {
    this.clearAlert();
    const config = AUTH_CONFIGS[this.currentScreenKey];
    const emailInput = document.getElementById('field-email');
    const passwordInput = document.getElementById('field-password');
    const confirmInput = document.getElementById('field-confirm-password');
    const nameInput = document.getElementById('field-name');
    const collegeInput = document.getElementById('field-college');
    const orgInput = document.getElementById('field-org');
    const phoneInput = document.getElementById('field-phone');
    const termsInput = document.getElementById('field-terms');

    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmPassword = confirmInput ? confirmInput.value : '';

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.showAlert('Please enter a valid email address.', 'error');
      if (emailInput) emailInput.focus();
      return;
    }

    if (config.type !== 'forgot') {
      if (!password || password.length < 8) {
        this.showAlert('Password must be at least 8 characters long.', 'error');
        if (passwordInput) passwordInput.focus();
        return;
      }
    }

    if (config.type === 'signup') {
      if (password !== confirmPassword) {
        this.showAlert('Passwords do not match. Please re-enter.', 'error');
        if (confirmInput) confirmInput.focus();
        return;
      }

      if (termsInput && !termsInput.checked) {
        this.showAlert('Please accept the Terms of Service to proceed.', 'error');
        return;
      }

      if (config.role === 'student') {
        if (!nameInput || !nameInput.value.trim()) {
          this.showAlert('Please enter your full name.', 'error');
          nameInput.focus();
          return;
        }
        if (!collegeInput || !collegeInput.value.trim()) {
          this.showAlert('Please enter your college / university name.', 'error');
          collegeInput.focus();
          return;
        }
      } else {
        if (!orgInput || !orgInput.value.trim()) {
          this.showAlert('Please enter your organisation / club name.', 'error');
          orgInput.focus();
          return;
        }
        if (!nameInput || !nameInput.value.trim()) {
          this.showAlert("Please enter the contact person's name.", 'error');
          nameInput.focus();
          return;
        }
      }
    }

    // Set Loading State
    this.setLoading(true);

    try {
      if (config.type === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role: config.role })
        });
        const res = await response.json();

        if (!response.ok || !res.success) {
          this.showAlert(res.error || 'Invalid credentials.', 'error');
          this.setLoading(false);
          return;
        }

        // Save session
        this.saveAuthSession(res.token, res.user);
        this.showToast(`Welcome back, ${res.user.name}! Redirecting...`, 'success');

        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          if (redirect) {
            window.location.href = redirect;
          } else {
            window.location.href = res.user.role === 'organiser' ? '/organiser/dashboard' : '/student/dashboard';
          }
        }, 800);

      } else if (config.type === 'signup') {
        const payload = {
          role: config.role,
          email,
          password,
          confirmPassword,
          termsAccepted: true
        };

        if (config.role === 'student') {
          payload.name = nameInput.value.trim();
          payload.college = collegeInput.value.trim();
        } else {
          payload.organisation = orgInput.value.trim();
          payload.name = nameInput.value.trim();
          payload.phone = phoneInput ? phoneInput.value.trim() : '';
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const res = await response.json();

        if (!response.ok || !res.success) {
          this.showAlert(res.error || 'Registration failed.', 'error');
          this.setLoading(false);
          return;
        }

        this.saveAuthSession(res.token, res.user);
        this.showToast('Account created successfully! Welcome to Eventify.', 'success');

        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          if (redirect) {
            window.location.href = redirect;
          } else {
            window.location.href = res.user.role === 'organiser' ? '/organiser/dashboard' : '/student/dashboard';
          }
        }, 900);

      } else if (config.type === 'forgot') {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role: config.role })
        });
        const res = await response.json();

        this.setLoading(false);
        this.authForm.classList.add('hidden');
        this.formConfirmation.classList.remove('hidden');
        this.confirmSubtext.textContent = config.role === 'organiser'
          ? `We've sent password reset instructions to your registered organisation email: ${email}`
          : `We've sent password reset instructions to your email address: ${email}`;

        this.showToast('Password reset link sent to your inbox!', 'success');
      }
    } catch (err) {
      console.error('Auth request error:', err);
      this.showAlert('Unable to connect to the authentication server. Please try again.', 'error');
      this.setLoading(false);
    }
  }

  saveAuthSession(token, user) {
    try {
      localStorage.setItem('eventify_token', token);
      localStorage.setItem('eventify_user', JSON.stringify(user));
    } catch (e) {}
  }

  setLoading(isLoading) {
    if (!this.submitBtn) return;
    if (isLoading) {
      this.submitBtn.disabled = true;
      this.submitBtn.style.opacity = '0.7';
      this.submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#183153]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>Processing...</span>
      `;
    } else {
      this.submitBtn.disabled = false;
      this.submitBtn.style.opacity = '1';
      const config = AUTH_CONFIGS[this.currentScreenKey];
      this.submitBtn.innerHTML = `
        <span>${config ? config.right.submitText : 'Submit'}</span>
        <span>&rarr;</span>
      `;
    }
  }

  showAlert(message, type = 'error') {
    if (!this.formAlert) return;
    const isError = type === 'error';
    this.formAlert.className = `mb-4 p-3 rounded-[10px] text-xs font-semibold flex items-start gap-2.5 ${
      isError 
        ? 'bg-rose-50 text-rose-800 border border-rose-200' 
        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
    }`;
    this.formAlert.innerHTML = `
      <span class="text-sm leading-none">${isError ? '⚠️' : '✓'}</span>
      <span class="flex-1 leading-relaxed">${message}</span>
    `;
    this.formAlert.classList.remove('hidden');
  }

  clearAlert() {
    if (this.formAlert) {
      this.formAlert.classList.add('hidden');
      this.formAlert.innerHTML = '';
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    const isError = type === 'error';

    toast.className = `px-4 py-3 rounded-[10px] text-xs font-semibold flex items-center gap-2.5 max-w-sm shadow-card pointer-events-auto transition-all ${
      isSuccess 
        ? 'bg-[#183153] text-white border-l-4 border-l-[#83C5F7]' 
        : isError 
          ? 'bg-rose-900 text-white border-l-4 border-l-rose-400' 
          : 'bg-white text-[#183153] border border-[#E4ECF3]'
    }`;

    toast.innerHTML = `
      <span>${isSuccess ? '✓' : isError ? '⚠️' : 'ℹ️'}</span>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  showHelp() {
    this.showToast('Need help? Contact support@eventify.campus or join our Student Discord!', 'info');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.authApp = new AuthApp();
});
