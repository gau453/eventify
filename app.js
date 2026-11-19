/**
 * EVENTIFY — Core Application Logic
 * Student-Focused Event Discovery & Organiser Platform
 * Recreated accurately to Figma specifications & live video mockup
 */

// Initial Seed Data: Categories
const DEFAULT_CATEGORIES = [
  {
    id: 'tech',
    name: 'Technology',
    type: 'photo',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    icon: `<svg class="w-4 h-4 text-[#183153]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
    count: '48 events'
  },
  {
    id: 'cultural',
    name: 'Cultural & Arts',
    type: 'photo',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    icon: `<svg class="w-4 h-4 text-[#183153]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>`,
    count: '32 events'
  },
  {
    id: 'sports',
    name: 'Sports',
    type: 'photo',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
    icon: `<svg class="w-4 h-4 text-[#183153]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
    count: '24 events'
  },
  {
    id: 'business',
    name: 'Business & Entrepreneurship',
    type: 'icon',
    bg: 'bg-white',
    icon: `<svg class="w-5 h-5 text-[#83C5F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
    count: '18 events'
  },
  {
    id: 'workshops',
    name: 'Workshops',
    type: 'icon',
    bg: 'bg-[#DCEAF5]',
    icon: `<svg class="w-5 h-5 text-[#183153]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
    count: '28 events'
  },
  {
    id: 'design',
    name: 'Design',
    type: 'icon',
    bg: 'bg-white',
    icon: `<svg class="w-5 h-5 text-[#83C5F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>`,
    count: '15 events'
  }
];

// Initial Seed Data: Featured Flagship Events
const DEFAULT_FEATURED_EVENTS = [
  {
    id: 'evt-1',
    title: 'National-Level Hackathon 2027',
    organiser: 'TechVerse University',
    college: 'TechVerse University',
    dateBadge: '16-18 MAR',
    date: '16-18 MAR 2027 • 48 hrs sprint',
    venue: 'Innovation Centre, Bengaluru',
    isOnline: false,
    category: 'Hackathon',
    status: 'Registrations open',
    statusType: 'open',
    spotsLeft: 42,
    totalSpots: 350,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    description: 'Join 500+ student developers, designers, and innovators for 48 hours of collaborative coding, mentorship from top engineers, and prize pool grants.',
    perks: ['Free food & swags', 'Direct internship interviews', 'Hardware lab access', 'Travel subsidies']
  },
  {
    id: 'evt-2',
    title: 'Euphoria — Annual Cultural Fest',
    organiser: "St. Xavier's College",
    college: "St. Xavier's College",
    dateBadge: '24-26 MAR',
    date: '24-26 MAR 2027 • 6:00 PM',
    venue: 'Main Campus, Mumbai',
    isOnline: false,
    category: 'Cultural',
    status: 'Selling fast',
    statusType: 'fast',
    spotsLeft: 84,
    totalSpots: 1000,
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    description: 'The largest inter-college cultural festival featuring live music concerts, battle of the bands, street choreography, art installations, and campus carnival zones.',
    perks: ['Celebrity artist night', 'College ID entry pass', 'Food truck alleys', 'Certificate of participation']
  },
  {
    id: 'evt-3',
    title: 'The Big Startup Pitch',
    organiser: 'E-Cell, IIM Ahmedabad',
    college: 'E-Cell, IIM Ahmedabad',
    dateBadge: '02 APR',
    date: '02 APR 2027 • 10:00 AM',
    venue: 'Online event',
    isOnline: true,
    category: 'Business',
    status: 'Registrations open',
    statusType: 'open',
    spotsLeft: 16,
    totalSpots: 50,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    description: 'Present your venture pitch deck in front of angel investors, early-stage venture capitalists, and alumni founders. Selected startups receive pre-seed funding and incubation space.',
    perks: ['VC 1-on-1 feedback', 'Cloud credits grant ($10k)', 'Legal & incorporation help', 'Investor networking dinner']
  },
  {
    id: 'evt-4',
    title: 'Designing for Real People',
    organiser: 'Design Circle India',
    college: 'Design Circle India',
    dateBadge: '08 APR',
    date: '08 APR 2027 • 4:00 PM',
    venue: 'WeWork Koramangala',
    isOnline: false,
    category: 'Design',
    status: 'Selling fast',
    statusType: 'fast',
    spotsLeft: 12,
    totalSpots: 80,
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    description: 'Master component tokenization, accessible contrast architectures, dynamic variants, and auto-layout patterns with senior product designers.',
    perks: ['Figma Community UI Kit', 'Portfolio critique session', 'Design token template', 'Verified Completion Certificate']
  }
];

// Initial Seed Data: Upcoming Events ("What's happening next?")
const DEFAULT_TRENDING_EVENTS = [
  {
    id: 'tr-1',
    title: 'Campus Creators Meetup',
    organiser: 'Campus Creator Network',
    day: '12',
    month: 'APR',
    time: '5:00 PM - 7:30 PM',
    location: 'The Hive, Pune',
    category: 'COMMUNITY',
    isOnline: false,
    attendees: 140,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'tr-2',
    title: 'AI for Everyone: Masterclass',
    organiser: 'Tech Community Hub',
    day: '16',
    month: 'APR',
    time: '11:00 AM - 1:00 PM',
    location: 'Online event',
    category: 'TECHNOLOGY',
    isOnline: true,
    attendees: 290,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'tr-3',
    title: 'Inter-College Basketball Finals',
    organiser: 'SRM Sports Council',
    day: '21',
    month: 'APR',
    time: '4:30 PM - 7:30 PM',
    location: 'SRM Indoor Arena',
    category: 'SPORTS',
    isOnline: false,
    attendees: 320,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80'
  }
];

// Application Controller
class EventifyApp {
  constructor() {
    this.categories = DEFAULT_CATEGORIES;
    this.featuredEvents = this.loadStoredEvents('eventify_featured_v3', DEFAULT_FEATURED_EVENTS);
    this.trendingEvents = this.loadStoredEvents('eventify_trending_v3', DEFAULT_TRENDING_EVENTS);
    this.registeredEvents = this.loadSet('eventify_registered');
    this.bookmarkedEvents = this.loadSet('eventify_bookmarked');
    this.activeCategory = null;
    this.searchQuery = '';
    this.activeUser = this.loadUser();

    this.initElements();
    this.bindEvents();
    this.render();
    this.checkPendingRegistration();
  }

  loadStoredEvents(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  saveStoredEvents(key, events) {
    try {
      localStorage.setItem(key, JSON.stringify(events));
    } catch (e) {}
  }

  loadSet(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (e) {
      return new Set();
    }
  }

  saveSet(key, setObj) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(setObj)));
    } catch (e) {}
  }

  loadUser() {
    try {
      const u = localStorage.getItem('eventify_user');
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed && parsed.name === 'Alex Johnson') {
          localStorage.removeItem('eventify_user');
          return null;
        }
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  saveUser(user) {
    this.activeUser = user;
    try {
      localStorage.setItem('eventify_user', JSON.stringify(user));
    } catch (e) {}
    this.updateUserUI();
  }

  initElements() {
    this.categoryCarousel = document.getElementById('category-carousel');
    this.carouselPrevBtn = document.getElementById('carousel-prev');
    this.carouselNextBtn = document.getElementById('carousel-next');
    this.featuredGrid = document.getElementById('featured-events-grid');
    this.trendingGrid = document.getElementById('trending-events-grid');
    this.heroSearchInput = document.getElementById('hero-search-input');
    this.heroSearchBtn = document.getElementById('hero-search-btn');
    this.activeFilterBadge = document.getElementById('active-filter-badge');
    this.filterLabel = document.getElementById('active-filter-label');
    this.clearFilterBtn = document.getElementById('clear-filter-btn');

    this.hostModal = document.getElementById('host-event-modal');
    this.eventDetailsModal = document.getElementById('event-details-modal');
    this.authModal = document.getElementById('auth-modal');
    this.myEventsDrawer = document.getElementById('my-events-drawer');
    this.mobileNavDrawer = document.getElementById('mobile-nav-drawer');

    this.myEventsBadge = document.getElementById('my-events-count-badge');
    this.myEventsDrawerList = document.getElementById('my-events-drawer-list');

    this.hostEventForm = document.getElementById('host-event-form');
    this.authForm = document.getElementById('auth-form');
  }

  bindEvents() {
    if (this.carouselPrevBtn && this.carouselNextBtn && this.categoryCarousel) {
      this.carouselPrevBtn.addEventListener('click', () => {
        this.categoryCarousel.scrollBy({ left: -260, behavior: 'smooth' });
      });
      this.carouselNextBtn.addEventListener('click', () => {
        this.categoryCarousel.scrollBy({ left: 260, behavior: 'smooth' });
      });
      this.categoryCarousel.addEventListener('scroll', () => this.updateCarouselControls());
    }

    if (this.heroSearchInput) {
      this.heroSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderFilteredEvents();
      });
      this.heroSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.scrollToEvents();
        }
      });
    }

    if (this.heroSearchBtn) {
      this.heroSearchBtn.addEventListener('click', () => {
        this.scrollToEvents();
      });
    }

    if (this.clearFilterBtn) {
      this.clearFilterBtn.addEventListener('click', () => {
        this.setCategoryFilter(null);
      });
    }

    const viewAllCat = document.getElementById('view-all-categories-btn');
    if (viewAllCat) {
      viewAllCat.addEventListener('click', (e) => {
        e.preventDefault();
        this.setCategoryFilter(null);
        this.scrollToEvents();
      });
    }

    document.querySelectorAll('.trigger-host-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.activeUser && this.activeUser.role === 'organiser') {
          // Organiser is signed in, open host modal
          const collegeInput = document.getElementById('new-event-college');
          if (collegeInput && this.activeUser.organisation) {
            collegeInput.value = this.activeUser.organisation;
          }
          this.openHostModal();
        } else if (this.activeUser && this.activeUser.role === 'student') {
          this.showToast('Organiser login required to publish campus events. Redirecting...', 'info');
          setTimeout(() => {
            window.location.href = '/organiser/login';
          }, 800);
        } else {
          // Not logged in, direct to organiser login
          window.location.href = '/organiser/login';
        }
      });
    });

    document.querySelectorAll('.trigger-my-events').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!this.activeUser) {
          this.showToast('Please sign in to view your registered passes. Redirecting...', 'info');
          setTimeout(() => {
            window.location.href = '/student/login';
          }, 450);
          return;
        }
        this.openMyEventsDrawer();
      });
    });

    document.querySelectorAll('.trigger-signin-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openAuthModal();
      });
    });

    const mobileMenuOpenBtn = document.getElementById('mobile-menu-toggle');
    const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');
    if (mobileMenuOpenBtn) {
      mobileMenuOpenBtn.addEventListener('click', () => this.openMobileNav());
    }
    if (mobileMenuCloseBtn) {
      mobileMenuCloseBtn.addEventListener('click', () => this.closeMobileNav());
    }

    if (this.hostEventForm) {
      this.hostEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateEvent();
      });
    }

    if (this.authForm) {
      this.authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAuth();
      });
    }

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    document.querySelectorAll('[data-category-select]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category-select');
        this.setCategoryFilter(cat);
        this.scrollToEvents();
      });
    });
  }

  scrollToEvents() {
    const el = document.getElementById('featured-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateCarouselControls() {
    if (!this.categoryCarousel || !this.carouselPrevBtn || !this.carouselNextBtn) return;
    const maxScroll = this.categoryCarousel.scrollWidth - this.categoryCarousel.clientWidth;
    const current = this.categoryCarousel.scrollLeft;

    this.carouselPrevBtn.disabled = current <= 5;
    this.carouselNextBtn.disabled = current >= maxScroll - 5;
    this.carouselPrevBtn.style.opacity = current <= 5 ? '0.4' : '1';
    this.carouselNextBtn.style.opacity = current >= maxScroll - 5 ? '0.4' : '1';
  }

  setCategoryFilter(categoryName) {
    if (this.activeCategory === categoryName) {
      this.activeCategory = null;
    } else {
      this.activeCategory = categoryName;
    }

    if (this.activeFilterBadge && this.filterLabel) {
      if (this.activeCategory) {
        this.activeFilterBadge.classList.remove('hidden');
        this.filterLabel.textContent = `Category: ${this.activeCategory}`;
      } else {
        this.activeFilterBadge.classList.add('hidden');
      }
    }

    this.renderCategoryCards();
    this.renderFilteredEvents();
  }

  render() {
    this.renderCategoryCards();
    this.renderFilteredEvents();
    this.updateUserUI();
    this.updateMyEventsUI();
    setTimeout(() => this.updateCarouselControls(), 150);
  }

  renderCategoryCards() {
    if (!this.categoryCarousel) return;

    this.categoryCarousel.innerHTML = this.categories.map(cat => {
      const isSelected = this.activeCategory === cat.name;
      const borderClass = isSelected 
        ? 'ring-2 ring-[#83C5F7] ring-offset-2 ring-offset-[#F4F8FC] border-[#83C5F7]' 
        : 'border-[#E4ECF3] hover:border-[#83C5F7]';

      if (cat.type === 'photo') {
        return `
          <div 
            onclick="window.app.setCategoryFilter('${cat.name}')"
            role="button"
            tabindex="0"
            aria-label="Filter by ${cat.name}"
            class="carousel-card relative flex-shrink-0 w-[240px] h-[190px] rounded-[14px] overflow-hidden cursor-pointer select-none card-hover-lift border ${borderClass} group"
          >
            <img 
              src="${cat.image}" 
              alt="${cat.name}" 
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              loading="lazy"
            />
            <div class="photo-gradient-overlay absolute inset-0"></div>
            
            <div class="absolute inset-0 p-4 flex flex-col justify-between z-10">
              <div class="flex items-center justify-between">
                <div class="w-8 h-8 rounded-[8px] bg-[#83C5F7] flex items-center justify-center shadow-xs">
                  ${cat.icon}
                </div>
                ${isSelected ? '<span class="w-2.5 h-2.5 rounded-full bg-[#83C5F7] shadow-sm"></span>' : ''}
              </div>

              <div>
                <h3 class="text-white text-base font-bold font-heading leading-tight drop-shadow-sm">
                  ${cat.name}
                </h3>
                <p class="text-xs text-white/80 mt-0.5 font-medium">
                  ${cat.count}
                </p>
              </div>
            </div>
          </div>
        `;
      } else {
        return `
          <div 
            onclick="window.app.setCategoryFilter('${cat.name}')"
            role="button"
            tabindex="0"
            aria-label="Filter by ${cat.name}"
            class="carousel-card relative flex-shrink-0 w-[240px] h-[190px] rounded-[14px] p-4 cursor-pointer select-none card-hover-lift border ${borderClass} ${cat.bg || 'bg-white'} flex flex-col justify-between group shadow-subtle"
          >
            <div class="flex items-center justify-between">
              <div class="w-8 h-8 rounded-[8px] bg-[#F4F8FC] border border-[#E4ECF3] flex items-center justify-center shadow-xs">
                ${cat.icon}
              </div>
              ${isSelected ? '<span class="w-2.5 h-2.5 rounded-full bg-[#83C5F7] shadow-sm"></span>' : ''}
            </div>

            <div>
              <h3 class="text-[#183153] text-base font-bold font-heading leading-snug">
                ${cat.name}
              </h3>
              <p class="text-xs text-[#66788C] mt-0.5 font-medium">
                ${cat.count}
              </p>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  renderFilteredEvents() {
    let filteredFeatured = this.featuredEvents.filter(evt => {
      const matchCat = !this.activeCategory || 
        evt.category.toLowerCase().includes(this.activeCategory.toLowerCase()) ||
        this.activeCategory.toLowerCase().includes(evt.category.toLowerCase());
      const matchQuery = !this.searchQuery || 
        evt.title.toLowerCase().includes(this.searchQuery) ||
        evt.organiser.toLowerCase().includes(this.searchQuery) ||
        evt.category.toLowerCase().includes(this.searchQuery) ||
        evt.venue.toLowerCase().includes(this.searchQuery);
      return matchCat && matchQuery;
    });

    let filteredTrending = this.trendingEvents.filter(evt => {
      const matchCat = !this.activeCategory || 
        evt.category.toLowerCase().includes(this.activeCategory.toLowerCase()) ||
        this.activeCategory.toLowerCase().includes(evt.category.toLowerCase());
      const matchQuery = !this.searchQuery || 
        evt.title.toLowerCase().includes(this.searchQuery) ||
        evt.organiser.toLowerCase().includes(this.searchQuery) ||
        evt.category.toLowerCase().includes(this.searchQuery) ||
        evt.location.toLowerCase().includes(this.searchQuery);
      return matchCat && matchQuery;
    });

    // Render Featured Cards (4 Columns)
    if (this.featuredGrid) {
      if (filteredFeatured.length === 0) {
        this.featuredGrid.innerHTML = `
          <div class="col-span-full py-12 text-center bg-white rounded-[14px] border border-[#E4ECF3] p-8">
            <h3 class="text-lg font-bold font-heading text-[#183153]">No events found</h3>
            <p class="text-xs text-[#66788C] mt-1">Try adjusting your search query or reset category filter.</p>
            <button onclick="window.app.setCategoryFilter(null)" class="mt-4 px-4 py-2 bg-[#83C5F7] text-[#183153] font-semibold text-xs rounded-[10px]">
              Reset Filter
            </button>
          </div>
        `;
      } else {
        this.featuredGrid.innerHTML = filteredFeatured.map(evt => {
          const isRegistered = this.registeredEvents.has(evt.id);
          const isFast = evt.statusType === 'fast' || evt.status.toLowerCase().includes('fast');

          return `
            <div class="bg-white rounded-[14px] border border-[#E4ECF3] overflow-hidden card-hover-lift flex flex-col justify-between group shadow-subtle">
              <div>
                <!-- Image Header with Date & Category Badges -->
                <div class="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img 
                    src="${evt.image}" 
                    alt="${evt.title}" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  
                  <!-- Top Badges -->
                  <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span class="px-2.5 py-1 rounded-[6px] bg-black/85 backdrop-blur-xs text-[11px] font-bold text-white tracking-wider uppercase">
                      ${evt.dateBadge || 'UPCOMING'}
                    </span>
                    <span class="px-2.5 py-1 rounded-[6px] bg-white/95 text-[11px] font-bold text-[#183153] shadow-xs">
                      ${evt.category}
                    </span>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="p-4">
                  <!-- Organiser Line with Building Icon -->
                  <div class="flex items-center gap-1.5 text-xs text-[#66788C] font-medium mb-1.5">
                    <svg class="w-3.5 h-3.5 text-[#66788C] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <span class="truncate">${evt.organiser}</span>
                  </div>

                  <!-- Title -->
                  <h3 class="text-base font-bold font-heading text-[#183153] leading-snug group-hover:text-[#183153]/80 transition-colors line-clamp-2">
                    ${evt.title}
                  </h3>

                  <!-- Venue Location -->
                  <p class="text-xs text-[#66788C] mt-2 flex items-center gap-1 truncate">
                    ${evt.isOnline ? '🌐 Online event' : '📍 ' + evt.venue}
                  </p>
                </div>
              </div>

              <!-- Footer with Status & Action Link -->
              <div class="px-4 py-3 border-t border-[#E4ECF3] flex items-center justify-between text-xs">
                <span class="flex items-center gap-1.5 font-medium ${isFast ? 'text-amber-700' : 'text-emerald-700'}">
                  ${isFast ? '🔥' : '<span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>'}
                  ${evt.status}
                </span>

                <button 
                  onclick="window.app.openEventDetails('${evt.id}')"
                  class="font-semibold text-[#183153] hover:text-[#83C5F7] transition-colors flex items-center gap-0.5"
                >
                  ${isRegistered ? '✓ Registered' : 'View details →'}
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Upcoming Events List ("What's happening next?")
    if (this.trendingGrid) {
      if (filteredTrending.length === 0) {
        this.trendingGrid.innerHTML = `
          <div class="py-6 text-center text-xs text-[#66788C]">
            No upcoming events found.
          </div>
        `;
      } else {
        this.trendingGrid.innerHTML = filteredTrending.map(evt => {
          const isRegistered = this.registeredEvents.has(evt.id);

          return `
            <div class="bg-white rounded-[14px] border border-[#E4ECF3] p-4 card-hover-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
              
              <!-- Left: Image, Date Block & Info -->
              <div class="flex items-center gap-4 flex-1 min-w-0">
                <!-- Thumbnail -->
                <div class="w-24 h-20 rounded-[10px] overflow-hidden flex-shrink-0 bg-slate-100">
                  <img src="${evt.image}" alt="${evt.title}" class="w-full h-full object-cover" loading="lazy" />
                </div>

                <!-- Date Block -->
                <div class="w-12 text-center flex-shrink-0 pr-1 border-r border-[#E4ECF3]">
                  <span class="block text-2xl font-extrabold font-heading text-[#183153] leading-none">${evt.day}</span>
                  <span class="block text-[11px] font-bold text-[#83C5F7] uppercase tracking-wider mt-0.5">${evt.month}</span>
                </div>

                <!-- Details -->
                <div class="min-w-0 flex-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#83C5F7]">
                    ${evt.category}
                  </span>
                  <h4 class="text-base font-bold font-heading text-[#183153] leading-tight truncate mt-0.5">
                    ${evt.title}
                  </h4>
                  <div class="flex items-center gap-2 text-xs text-[#66788C] mt-1 truncate">
                    <span>🕒 ${evt.time}</span>
                    <span>•</span>
                    <span class="truncate">${evt.isOnline ? '🌐 Online event' : '📍 ' + evt.location}</span>
                  </div>
                </div>
              </div>

              <!-- Right: Register Button -->
              <div class="flex items-center justify-end flex-shrink-0">
                <button 
                  onclick="window.app.quickRegister('${evt.id}', '${evt.title.replace(/'/g, "\\'")}')"
                  class="px-5 py-2 rounded-[10px] text-xs font-semibold ${isRegistered ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-[#83C5F7] text-[#183153] border border-[#E4ECF3] hover:border-transparent'} transition-colors btn-spring shadow-xs"
                >
                  ${isRegistered ? '✓ Registered' : 'Register'}
                </button>
              </div>

            </div>
          `;
        }).join('');
      }
    }
  }

  // Event Details Modal
  openEventDetails(id) {
    const evt = this.featuredEvents.find(e => e.id === id) || this.trendingEvents.find(e => e.id === id);
    if (!evt) return;

    const modalBody = document.getElementById('event-details-content');
    const isRegistered = this.registeredEvents.has(evt.id);

    modalBody.innerHTML = `
      <div class="relative h-60 w-full">
        <img src="${evt.image}" alt="${evt.title}" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
        <button 
          onclick="window.app.closeAllModals()" 
          class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors text-sm"
        >
          ✕
        </button>
        
        <div class="absolute bottom-5 left-6 right-6 text-white">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-2.5 py-0.5 rounded bg-[#83C5F7] text-xs font-bold text-[#183153]">
              ${evt.category}
            </span>
            <span class="text-xs text-white/90">
              ${evt.isOnline ? '🌐 Virtual Event' : '📍 Campus Venue'}
            </span>
          </div>
          <h2 class="text-2xl font-bold font-heading text-white leading-tight">
            ${evt.title}
          </h2>
          <p class="text-xs text-white/80 mt-1">Organised by ${evt.organiser}</p>
        </div>
      </div>

      <div class="p-6 space-y-5">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-[12px] bg-[#F4F8FC] border border-[#E4ECF3]">
          <div>
            <span class="text-[10px] font-bold text-[#66788C] uppercase tracking-wider">Date & Time</span>
            <p class="text-xs font-semibold text-[#183153] mt-0.5">${evt.date || (evt.day + ' ' + evt.month + ' • ' + evt.time)}</p>
          </div>
          <div>
            <span class="text-[10px] font-bold text-[#66788C] uppercase tracking-wider">Location</span>
            <p class="text-xs font-semibold text-[#183153] mt-0.5 truncate">${evt.venue || evt.location}</p>
          </div>
          <div class="col-span-2 sm:col-span-1">
            <span class="text-[10px] font-bold text-[#66788C] uppercase tracking-wider">Eligibility</span>
            <p class="text-xs font-semibold text-emerald-600 mt-0.5">All College Students</p>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-bold font-heading text-[#183153]">About this Experience</h3>
          <p class="text-xs text-[#66788C] leading-relaxed mt-1.5">
            ${evt.description || 'Join students and mentors from top universities in this high-impact event designed to broaden your horizon, build lasting networks, and create memorable experiences.'}
          </p>
        </div>

        ${evt.perks && evt.perks.length > 0 ? `
          <div>
            <h3 class="text-sm font-bold font-heading text-[#183153]">What's Included</h3>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
              ${evt.perks.map(p => `
                <li class="flex items-center gap-2 text-xs font-medium text-[#183153] bg-white p-2 rounded-[8px] border border-[#E4ECF3]">
                  <span class="text-[#83C5F7] font-bold">✓</span> ${p}
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="pt-4 border-t border-[#E4ECF3] flex items-center justify-between gap-4">
          <div>
            <span class="text-[11px] text-[#66788C]">Pass Type</span>
            <p class="text-base font-bold font-heading text-[#183153]">Free <span class="text-xs font-normal text-[#66788C]">(Student ID Entry)</span></p>
          </div>

          <button 
            onclick="window.app.registerForEvent('${evt.id}')"
            class="px-6 py-2.5 rounded-[10px] font-bold text-xs ${isRegistered ? 'bg-emerald-600 text-white' : 'bg-[#83C5F7] hover:bg-[#6eb7f2] text-[#183153]'} transition-colors btn-spring shadow-xs"
          >
            ${isRegistered ? '✓ You Are Registered' : 'Confirm Registration →'}
          </button>
        </div>
      </div>
    `;

    this.eventDetailsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  checkPendingRegistration() {
    try {
      const pendingId = sessionStorage.getItem('pending_event_reg');
      if (pendingId && this.activeUser) {
        sessionStorage.removeItem('pending_event_reg');
        const evt = this.featuredEvents.find(e => e.id === pendingId) || this.trendingEvents.find(e => e.id === pendingId);
        if (evt && !this.registeredEvents.has(pendingId)) {
          this.registeredEvents.add(pendingId);
          this.saveSet('eventify_registered', this.registeredEvents);
          setTimeout(() => {
            this.showToast(`🎉 Welcome! You are now registered for "${evt.title}".`, 'success');
            this.render();
          }, 350);
        }
      }
    } catch (e) {}
  }

  requireAuthForStudent(eventId = null) {
    if (!this.activeUser) {
      if (eventId) {
        try {
          sessionStorage.setItem('pending_event_reg', eventId);
        } catch (e) {}
      }
      this.showToast('Please sign in to your student account to register. Redirecting...', 'info');
      setTimeout(() => {
        window.location.href = '/student/login';
      }, 450);
      return false;
    }
    return true;
  }

  registerForEvent(id) {
    if (!this.requireAuthForStudent(id)) return;

    const evt = this.featuredEvents.find(e => e.id === id) || this.trendingEvents.find(e => e.id === id);
    if (!evt) return;

    if (this.registeredEvents.has(id)) {
      this.showToast('You are already registered for this event!');
      return;
    }

    this.registeredEvents.add(id);
    this.saveSet('eventify_registered', this.registeredEvents);

    this.showToast(`🎉 You're registered for "${evt.title}"! Ticket added to My Events.`, 'success');
    this.render();
    this.closeAllModals();
    this.openMyEventsDrawer();
  }

  quickRegister(id, title) {
    if (!this.requireAuthForStudent(id)) return;

    if (this.registeredEvents.has(id)) {
      this.showToast(`You are already registered for ${title}`);
      return;
    }
    this.registeredEvents.add(id);
    this.saveSet('eventify_registered', this.registeredEvents);
    this.showToast(`🎉 Registration confirmed for ${title}!`, 'success');
    this.render();
  }

  cancelRegistration(id) {
    if (this.registeredEvents.has(id)) {
      this.registeredEvents.delete(id);
      this.saveSet('eventify_registered', this.registeredEvents);
      this.showToast('Registration cancelled.');
      this.render();
    }
  }

  openHostModal() {
    this.closeAllModals();
    if (this.hostModal) {
      this.hostModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  handleCreateEvent() {
    const title = document.getElementById('new-event-title').value.trim();
    const college = document.getElementById('new-event-college').value.trim();
    const category = document.getElementById('new-event-category').value;
    const date = document.getElementById('new-event-date').value.trim();
    const venue = document.getElementById('new-event-venue').value.trim();
    const isOnline = document.getElementById('new-event-online').checked;
    const description = document.getElementById('new-event-desc').value.trim();
    const image = document.getElementById('new-event-image').value.trim() || 
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

    if (!title || !college || !category || !date || !venue) {
      this.showToast('Please fill in all required fields.', 'error');
      return;
    }

    const newEvent = {
      id: 'custom-' + Date.now(),
      title,
      organiser: college,
      college,
      dateBadge: 'NEW',
      date,
      venue,
      isOnline,
      category,
      status: 'Registrations open',
      statusType: 'open',
      image,
      description: description || 'Created by campus organiser on Eventify.',
      perks: ['Open Student Access', 'Verified Host', 'Certificate Available']
    };

    this.featuredEvents.unshift(newEvent);
    this.saveStoredEvents('eventify_featured_v3', this.featuredEvents);

    this.hostEventForm.reset();
    this.closeAllModals();
    this.render();

    this.showToast(`✨ "${title}" is now published on Eventify!`, 'success');
    this.scrollToEvents();
  }

  openMyEventsDrawer() {
    this.closeAllModals();
    this.updateMyEventsUI();
    if (this.myEventsDrawer) {
      this.myEventsDrawer.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  updateMyEventsUI() {
    const count = this.registeredEvents.size;
    if (this.myEventsBadge) {
      this.myEventsBadge.textContent = count;
      this.myEventsBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }

    if (!this.myEventsDrawerList) return;

    const allEvents = [...this.featuredEvents, ...this.trendingEvents];
    const registeredList = allEvents.filter(e => this.registeredEvents.has(e.id));

    if (registeredList.length === 0) {
      this.myEventsDrawerList.innerHTML = `
        <div class="py-16 text-center text-[#66788C]">
          <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-[#DCEAF5] text-[#183153] flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
          </div>
          <h4 class="font-bold text-[#183153] text-sm">No registered passes yet</h4>
          <p class="text-xs text-[#66788C] mt-1 max-w-xs mx-auto">Explore events on the homepage and register to build your campus calendar.</p>
        </div>
      `;
      return;
    }

    this.myEventsDrawerList.innerHTML = `
      <div class="space-y-3">
        ${registeredList.map(e => `
          <div class="p-3.5 rounded-[12px] bg-white border border-[#E4ECF3] flex items-center justify-between gap-3 shadow-xs">
            <div class="min-w-0">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Confirmed Ticket
              </span>
              <h5 class="text-xs font-bold font-heading text-[#183153] mt-1 truncate">${e.title}</h5>
              <p class="text-[11px] text-[#66788C]">${e.date || (e.day + ' ' + e.month)}</p>
            </div>
            <button 
              onclick="window.app.cancelRegistration('${e.id}')"
              class="text-xs text-red-500 hover:text-red-700 px-2 py-1 font-medium"
            >
              Cancel
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  openAuthModal() {
    this.closeAllModals();
    if (this.authModal) {
      this.authModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  handleAuth() {
    const email = document.getElementById('auth-email').value.trim();
    if (!email) {
      this.showToast('Please enter your email', 'error');
      return;
    }

    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    this.saveUser({ name, email, role: 'student' });
    this.closeAllModals();
    this.showToast(`Welcome back, ${name}! Signed in.`, 'success');
  }

  updateUserUI() {
    const signInLink = document.getElementById('user-signin-link');
    const profileContainer = document.getElementById('user-logged-in-profile');
    const displayName = document.getElementById('user-display-name');
    const roleBadge = document.getElementById('user-role-badge');
    const userDisplay = document.getElementById('user-status-display');

    if (this.activeUser && this.activeUser.name) {
      if (signInLink) signInLink.classList.add('hidden');
      if (profileContainer) {
        profileContainer.classList.remove('hidden');
        profileContainer.classList.add('flex');
      }
      if (displayName) displayName.textContent = this.activeUser.name;
      if (roleBadge) {
        roleBadge.textContent = this.activeUser.role === 'organiser' ? 'Organiser' : 'Student';
        roleBadge.className = this.activeUser.role === 'organiser'
          ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#83C5F7] text-[#183153]'
          : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCEAF5] text-[#183153]';
      }
      if (userDisplay) userDisplay.textContent = this.activeUser.name;
    } else {
      if (signInLink) signInLink.classList.remove('hidden');
      if (profileContainer) {
        profileContainer.classList.add('hidden');
        profileContainer.classList.remove('flex');
      }
      if (userDisplay) userDisplay.textContent = 'Sign In';
    }
  }

  logout() {
    try {
      localStorage.removeItem('eventify_token');
      localStorage.removeItem('eventify_user');
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (e) {}
    this.activeUser = null;
    this.updateUserUI();
    this.showToast('You have been signed out.', 'info');
  }

  openMobileNav() {
    if (this.mobileNavDrawer) {
      this.mobileNavDrawer.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  closeMobileNav() {
    if (this.mobileNavDrawer) {
      this.mobileNavDrawer.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  closeAllModals() {
    const modals = [this.hostModal, this.eventDetailsModal, this.authModal, this.myEventsDrawer, this.mobileNavDrawer];
    modals.forEach(m => {
      if (m) m.classList.add('hidden');
    });
    document.body.style.overflow = '';
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    const isError = type === 'error';

    toast.className = `toast px-4 py-3 rounded-[10px] text-xs font-semibold flex items-center gap-2.5 max-w-sm ${
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
      toast.style.animation = 'fadeOut 0.25s forwards';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new EventifyApp();
});
