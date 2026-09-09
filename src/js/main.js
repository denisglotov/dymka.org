// Main JavaScript for Dymka company (dymka.org)
document.addEventListener('DOMContentLoaded', () => {
  // Update copyright year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Mobile menu navigation toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Cookie Consent Banner Logic
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptCookiesBtn = document.getElementById('accept-cookies');
  const declineCookiesBtn = document.getElementById('decline-cookies');

  let currentConsent = localStorage.getItem('cookieConsent');
  const consentDate = localStorage.getItem('cookieConsentDate');

  // If declined, prompt again after 90 days (approx 3 months)
  if (currentConsent === 'declined' && consentDate) {
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    if (Date.now() - parseInt(consentDate, 10) > ninetyDays) {
      localStorage.removeItem('cookieConsent');
      localStorage.removeItem('cookieConsentDate');
      currentConsent = null;
    }
  }

  if (cookieBanner && !currentConsent) {
    // Show banner if no valid consent choice is present
    setTimeout(() => {
      cookieBanner.classList.add('show');
    }, 500);
  }

  if (acceptCookiesBtn) {
    acceptCookiesBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      // Clear any previous decline date
      localStorage.removeItem('cookieConsentDate');
      cookieBanner.classList.remove('show');

      // Update Google Analytics Consent Mode
      if (typeof gtag === 'function') {
        gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
    });
  }

  if (declineCookiesBtn) {
    declineCookiesBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'declined');
      localStorage.setItem('cookieConsentDate', Date.now().toString());
      cookieBanner.classList.remove('show');
    });
  }

  // Fullscreen toggle (game pages)
  const fullscreenToggle = document.getElementById('fs-toggle');

  if (fullscreenToggle) {
    const getFullscreenElement = () =>
      document.fullscreenElement || document.webkitFullscreenElement || null;
    const isFullscreen = () => Boolean(getFullscreenElement());

    const syncFullscreenButton = () => {
      const active = isFullscreen();
      fullscreenToggle.textContent = active ? '✕' : '⛶';
      fullscreenToggle.title = active ? 'Exit fullscreen' : 'Enter fullscreen';
      fullscreenToggle.setAttribute('aria-label', fullscreenToggle.title);
      fullscreenToggle.setAttribute('aria-pressed', String(active));
    };

    const requestFullscreen = (element) => {
      if (element.requestFullscreen) return element.requestFullscreen();
      if (element.webkitRequestFullscreen) return element.webkitRequestFullscreen();
      throw new Error('Fullscreen is not supported');
    };

    const exitFullscreen = () => {
      if (document.exitFullscreen) return document.exitFullscreen();
      if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
      throw new Error('Fullscreen is not supported');
    };

    fullscreenToggle.addEventListener('click', () => {
      try {
        const togglePromise = isFullscreen()
          ? exitFullscreen()
          : requestFullscreen(document.documentElement);
        // Browsers reject on ESC or missing gesture — ignore those errors
        Promise.resolve(togglePromise).catch(() => {});
      } catch (e) {
        // Fullscreen not supported; ignore
      }
    });

    document.addEventListener('fullscreenchange', syncFullscreenButton);
    document.addEventListener('webkitfullscreenchange', syncFullscreenButton);
  }
});
