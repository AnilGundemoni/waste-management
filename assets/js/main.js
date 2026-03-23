/**
 * ECOTRACK - Waste Management & Recycling Solutions
 * Main JavaScript Module
 */

'use strict';

// ============================================================
// Theme Management (Dark / Light)
// ============================================================
const ThemeManager = (() => {
  const KEY = 'ecotrack-theme';

  function getPreferred() {
    const stored = localStorage.getItem(KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(btn => {
      const icon = btn.querySelector('i');
      if (!icon) return;
      if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        btn.setAttribute('aria-label', 'Switch to light mode');
      } else {
        icon.className = 'fas fa-moon';
        btn.setAttribute('aria-label', 'Switch to dark mode');
      }
    });
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    apply(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    apply(getPreferred());
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(KEY)) apply(e.matches ? 'dark' : 'light');
    });
  }

  return { init, toggle, apply };
})();

// ============================================================
// Navigation
// ============================================================
const NavManager = (() => {
  const KNOWN_ROUTES = [
    '/index.html',
    '/404.html',
    '/pages/about.html',
    '/pages/blog.html',
    '/pages/contact.html',
    '/pages/dashboard.html',
    '/pages/login.html',
    '/pages/signup.html',
    '/pages/schedule.html',
    '/pages/services.html',
    '/pages/coming-soon.html',
    '/pages/user-dashboard.html'
  ];

  function isInsidePages() {
    return window.location.pathname.replace(/\\/g, '/').includes('/pages/');
  }

  function getRoutePath(route) {
    const inPages = isInsidePages();
    if (route === '404') return inPages ? '../404.html' : '404.html';
    return '#';
  }

  function isKnownRoute(pathname) {
    const normalized = (pathname || '').toLowerCase().replace(/\\/g, '/');
    return KNOWN_ROUTES.some(route => normalized.endsWith(route));
  }

  function enableRouteGuard() {
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

      let url;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (!url.pathname.toLowerCase().endsWith('.html')) return;
      if (isKnownRoute(url.pathname)) return;

      event.preventDefault();
      const fallback = `${getRoutePath('404')}?missing=${encodeURIComponent(url.pathname)}`;
      window.location.href = fallback;
    });
  }

  function init() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    enableRouteGuard();

    // Scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    }, { passive: true });

    // Hamburger toggle
    hamburger?.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu?.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active').toString());
    });

    // Close nav on link click (mobile)
    navMenu?.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });

    // Active link highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link[href]').forEach(link => {
      const href = link.getAttribute('href').split('/').pop();
      if (href === currentPage) link.classList.add('active');
    });

    // Close menu on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.navbar')) {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('open');
      }
    });
  }

  return { init };
})();

// ============================================================
// Scroll To Top
// ============================================================
const ScrollTop = (() => {
  function init() {
    const btn = document.querySelector('.scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  return { init };
})();

// ============================================================
// Animated Counters
// ============================================================
const CounterAnimation = (() => {
  function animateValue(el, start, end, duration) {
    let startTime = null;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * eased);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function init() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          const end = parseInt(entry.target.dataset.count);
          animateValue(entry.target, 0, end, 1800);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }
  return { init };
})();

// ============================================================
// Scroll Reveal Animations
// ============================================================
const ScrollReveal = (() => {
  function init() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!elements.length) return;

    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay || 0;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  }
  return { init };
})();

// ============================================================
// Toast Notifications
// ============================================================
const Toast = (() => {
  function show(message, type = 'info', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
    const colors = { success: '#22c55e', error: '#ef4444', info: '#3b82f6' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fas ${icons[type] || icons.info}" style="color:${colors[type] || colors.info};font-size:1.1rem;flex-shrink:0"></i>
      <span style="flex:1;color:var(--text-primary)">${message}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:2px 4px;font-size:0.9rem;"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastIn 0.3s ease reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  return { show };
})();

// ============================================================
// Form Validation
// ============================================================
const FormValidator = (() => {
  const rules = {
    required: (val) => val.trim() !== '' || 'This field is required.',
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Please enter a valid email address.',
    phone: (val) => /^[\d\s\+\-\(\)]{7,15}$/.test(val) || 'Please enter a valid phone number.',
    minlength: (val, len) => val.trim().length >= len || `Minimum ${len} characters required.`,
  };

  function validateField(input) {
    const validations = input.dataset.validate?.split(' ') || [];
    let error = null;

    for (const rule of validations) {
      const [name, param] = rule.split(':');
      if (rules[name]) {
        const result = rules[name](input.value, param);
        if (result !== true) { error = result; break; }
      }
    }

    const group = input.closest('.form-group');
    const existing = group?.querySelector('.form-error');
    existing?.remove();
    input.classList.toggle('error', !!error);

    if (error && group) {
      const msg = document.createElement('span');
      msg.className = 'form-error';
      msg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error}`;
      group.appendChild(msg);
    }
    return !error;
  }

  function init(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    form.querySelectorAll('[data-validate]').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) validateField(input);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[data-validate]').forEach(input => {
        if (!validateField(input)) valid = false;
      });

      if (valid) {
        Toast.show('Message sent successfully! We\'ll contact you soon.', 'success');
        form.reset();
      } else {
        Toast.show('Please fix the errors before submitting.', 'error');
      }
    });
  }
  return { init };
})();

// ============================================================
// Lazy Loading Images
// ============================================================
const LazyLoad = (() => {
  function init() {
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        if (img.dataset.src) img.src = img.dataset.src;
      });
    } else {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
            observer.unobserve(img);
          }
        });
      });
      document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
    }
  }
  return { init };
})();

// ============================================================
// FAQ Accordion
// ============================================================
const Accordion = (() => {
  function init(selector = '.faq-item') {
    document.querySelectorAll(selector).forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!question || !answer) return;

      answer.style.maxHeight = '0';
      answer.style.overflow = 'hidden';
      answer.style.transition = 'max-height 0.35s ease, padding 0.35s ease';

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll(selector).forEach(i => {
          i.classList.remove('open');
          const a = i.querySelector('.faq-answer');
          if (a) a.style.maxHeight = '0';
          const icon = i.querySelector('.faq-icon');
          if (icon) icon.style.transform = 'rotate(0)';
        });

        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          const icon = item.querySelector('.faq-icon');
          if (icon) icon.style.transform = 'rotate(45deg)';
        }
      });
    });
  }
  return { init };
})();

// ============================================================
// Tab Switcher
// ============================================================
const Tabs = (() => {
  function init(containerSelector = '.tabs') {
    document.querySelectorAll(containerSelector).forEach(container => {
      const tabBtns = container.querySelectorAll('[data-tab]');
      const tabPanels = container.querySelectorAll('[data-tab-panel]');

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tab;
          tabBtns.forEach(b => b.classList.remove('active'));
          tabPanels.forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          container.querySelector(`[data-tab-panel="${target}"]`)?.classList.add('active');
        });
      });
    });
  }
  return { init };
})();

// ============================================================
// Progress Animation
// ============================================================
const ProgressBars = (() => {
  function init() {
    const bars = document.querySelectorAll('.progress-fill[data-width]');
    if (!bars.length) return;

    bars.forEach(bar => { bar.style.width = '0'; });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(bar => observer.observe(bar));
  }
  return { init };
})();

// ============================================================
// Cookie Consent
// ============================================================
const CookieConsent = (() => {
  function init() {
    if (localStorage.getItem('cookie-consent')) return;
    const banner = document.querySelector('.cookie-banner');
    if (!banner) return;
    banner.style.display = 'flex';

    banner.querySelector('.accept-cookies')?.addEventListener('click', () => {
      localStorage.setItem('cookie-consent', 'accepted');
      banner.remove();
    });
  }
  return { init };
})();

// ============================================================
// RTL (Right-to-Left) Manager
// ============================================================
const RTLManager = (() => {
  const KEY = 'ecotrack-rtl';

  function isRTL() {
    return document.documentElement.getAttribute('dir') === 'rtl';
  }

  function apply(rtl) {
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    localStorage.setItem(KEY, rtl ? 'rtl' : 'ltr');
    document.querySelectorAll('.rtl-toggle').forEach(btn => {
      btn.textContent = rtl ? 'LTR' : 'RTL';
      btn.setAttribute('title', rtl ? 'Switch to LTR layout' : 'Switch to RTL layout');
      btn.setAttribute('aria-label', rtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
    });
  }

  function toggle() { apply(!isRTL()); }

  function init() {
    const saved = localStorage.getItem(KEY);
    if (saved) apply(saved === 'rtl');
    document.querySelectorAll('.rtl-toggle').forEach(btn => {
      if (btn.dataset.rtlBound === 'true') return;
      btn.addEventListener('click', toggle);
      btn.dataset.rtlBound = 'true';
    });
  }

  return { init, toggle, apply };
})();

// ============================================================
// Authentication (Navbar Login)
// ============================================================
const AuthManager = (() => {
  const STORAGE_KEY = 'ecotrack-auth-user';
  const SESSION_KEY = 'ecotrack-auth-session-user';

  function getUser() {
    const persistent = localStorage.getItem(STORAGE_KEY);
    const session = sessionStorage.getItem(SESSION_KEY);
    const raw = persistent || session;
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveUser(user, remember) {
    const payload = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(STORAGE_KEY, payload);
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_KEY, payload);
    localStorage.removeItem(STORAGE_KEY);
  }

  function clearUser() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  function getDisplayName(email) {
    const beforeAt = (email || '').split('@')[0] || 'User';
    const normalized = beforeAt.replace(/[._-]+/g, ' ').trim();
    return normalized
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ') || 'User';
  }

  function createNavbarButton(actions) {
    const existing = actions.querySelector('.nav-login-btn');
    if (existing) return existing;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secondary btn-sm nav-login-btn';
    btn.setAttribute('aria-label', 'Open login panel');
    btn.innerHTML = '<i class="fas fa-user"></i> Login';

    const hamburger = actions.querySelector('.hamburger');
    if (hamburger) {
      actions.insertBefore(btn, hamburger);
    } else {
      actions.appendChild(btn);
    }

    return btn;
  }

  function getPageHref(pageName) {
    const inPages = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
    return inPages ? `${pageName}.html` : `pages/${pageName}.html`;
  }

  function ensureSignupLink(actions) {
    const existing = actions.querySelector('.nav-signup-link');
    if (existing) return existing;

    const link = document.createElement('a');
    link.className = 'btn btn-secondary btn-sm nav-signup-link';
    link.href = getPageHref('signup');
    link.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
    link.setAttribute('aria-label', 'Open signup page');

    const scheduleBtn = actions.querySelector('a[href*="schedule"]');
    const hamburger = actions.querySelector('.hamburger');
    if (scheduleBtn) {
      actions.insertBefore(link, scheduleBtn);
    } else if (hamburger) {
      actions.insertBefore(link, hamburger);
    } else {
      actions.appendChild(link);
    }

    return link;
  }

  function ensureModal() {
    let modal = document.querySelector('.auth-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="auth-modal-backdrop" data-auth-close></div>
      <div class="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
        <button type="button" class="auth-close" data-auth-close aria-label="Close login modal">
          <i class="fas fa-times"></i>
        </button>
        <div class="auth-modal-content"></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('[data-auth-close]').forEach(el => {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });

    return modal;
  }

  function renderLoginView(modal) {
    const content = modal.querySelector('.auth-modal-content');
    content.innerHTML = `
      <h2 id="authModalTitle" class="auth-title">Welcome Back</h2>
      <p class="auth-subtitle">Sign in to manage pickups, requests, and dashboard activity.</p>
      <form class="auth-form" id="authLoginForm" novalidate>
        <div class="form-group auth-group">
          <label class="form-label" for="authEmail">Email address</label>
          <input id="authEmail" type="email" class="form-control" placeholder="name@example.com" required />
          <small class="auth-error" data-auth-error="email"></small>
        </div>
        <div class="form-group auth-group">
          <label class="form-label" for="authPassword">Password</label>
          <input id="authPassword" type="password" class="form-control" placeholder="Minimum 6 characters" required minlength="6" />
          <small class="auth-error" data-auth-error="password"></small>
        </div>
        <label class="auth-remember">
          <input id="authRemember" type="checkbox" />
          <span>Remember me on this device</span>
        </label>
        <button type="submit" class="btn btn-primary auth-submit" id="authSubmitBtn">
          <i class="fas fa-right-to-bracket"></i> Sign In
        </button>
        <p class="auth-helper">Demo mode: use any valid email and password with at least 6 characters.</p>
      </form>
    `;

    const form = content.querySelector('#authLoginForm');
    const emailInput = content.querySelector('#authEmail');
    const passwordInput = content.querySelector('#authPassword');
    const rememberInput = content.querySelector('#authRemember');
    const submitBtn = content.querySelector('#authSubmitBtn');

    function setError(field, message) {
      const slot = content.querySelector(`[data-auth-error="${field}"]`);
      if (slot) slot.textContent = message || '';
    }

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = emailInput?.value.trim() || '';
      const password = passwordInput?.value || '';

      setError('email', '');
      setError('password', '');

      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const validPassword = password.length >= 6;

      if (!validEmail) setError('email', 'Enter a valid email address.');
      if (!validPassword) setError('password', 'Password must be at least 6 characters.');
      if (!validEmail || !validPassword) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

      setTimeout(() => {
        const user = {
          email,
          name: getDisplayName(email),
          lastLogin: new Date().toISOString()
        };

        saveUser(user, !!rememberInput?.checked);
        syncButtons();
        Toast.show(`Welcome back, ${user.name}!`, 'success', 2500);
        closeModal();
      }, 650);
    });
  }

  function renderAccountView(modal, user) {
    const content = modal.querySelector('.auth-modal-content');
    content.innerHTML = `
      <h2 id="authModalTitle" class="auth-title">My Account</h2>
      <p class="auth-subtitle">You are signed in and your session is active.</p>
      <div class="auth-account-card">
        <div class="auth-account-icon"><i class="fas fa-circle-user"></i></div>
        <div>
          <p class="auth-account-name">${user.name}</p>
          <p class="auth-account-email">${user.email}</p>
        </div>
      </div>
      <div class="auth-account-actions">
        <button type="button" class="btn btn-primary" data-auth-close>Continue</button>
        <button type="button" class="btn btn-secondary" id="authLogoutBtn">
          <i class="fas fa-right-from-bracket"></i> Logout
        </button>
      </div>
    `;

    content.querySelector('[data-auth-close]')?.addEventListener('click', closeModal);
    content.querySelector('#authLogoutBtn')?.addEventListener('click', () => {
      clearUser();
      syncButtons();
      Toast.show('You have been logged out.', 'info', 2400);
      renderLoginView(modal);
    });
  }

  function openModal() {
    const modal = ensureModal();
    const user = getUser();
    if (user) {
      renderAccountView(modal, user);
    } else {
      renderLoginView(modal);
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('auth-open');
  }

  function closeModal() {
    const modal = document.querySelector('.auth-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('auth-open');
  }

  function syncButtons() {
    document.querySelectorAll('.navbar-actions').forEach(actions => {
      ensureSignupLink(actions);
    });
  }

  function init() {
    ensureModal();
    syncButtons();
  }

  return { init };
})();

// ============================================================
// Bootstrap App
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavManager.init();
  ScrollTop.init();
  CounterAnimation.init();
  ScrollReveal.init();
  LazyLoad.init();
  Accordion.init();
  Tabs.init();
  ProgressBars.init();
  CookieConsent.init();
  FormValidator.init('#contact-form');
  FormValidator.init('#newsletter-form');
  RTLManager.init();
  AuthManager.init();
});

// Export for use in other modules
window.EcoTrack = { Toast, ThemeManager, FormValidator, RTLManager, AuthManager };
window.toggleRTL = RTLManager.toggle;
