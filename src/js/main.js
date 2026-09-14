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

  const currentConsent = localStorage.getItem('cookieConsent');

  if (cookieBanner && !currentConsent) {
    // Show banner if not yet acknowledged
    setTimeout(() => {
      cookieBanner.classList.add('show');
    }, 500);
  }

  if (acceptCookiesBtn) {
    acceptCookiesBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
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

  // Fullscreen toggle (game pages)
  const fullscreenToggle = document.getElementById('fs-toggle');

  if (fullscreenToggle) {
    // The browser Fullscreen API isn't available on iOS Safari (iPhone/iPad),
    // so hide the button there instead of showing a dead control.
    const isIOS = navigator.platform === 'iOS' || /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const fullscreenSupported =
      !isIOS &&
      (typeof document.documentElement.requestFullscreen === 'function' ||
        typeof document.documentElement.webkitRequestFullscreen === 'function');

    if (fullscreenSupported) {
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
    } else {
      fullscreenToggle.style.display = 'none';
    }
  }

  // Game loading overlay (game pages)
  const gameFrame = document.getElementById('game-frame');
  const gameLoading = document.getElementById('game-loading');

  if (gameFrame && gameLoading) {
    const hideGameLoading = () => {
      if (gameLoading.dataset.state === 'hidden') return;
      gameLoading.dataset.state = 'hidden';
      gameLoading.classList.add('hidden');
      // Remove from view after the fade-out transition completes
      setTimeout(() => {
        gameLoading.style.display = 'none';
      }, 500);
    };

    if (gameFrame.complete) {
      hideGameLoading();
    } else {
      gameFrame.addEventListener('load', hideGameLoading);
      // Fallback so the page is never left permanently covered
      setTimeout(hideGameLoading, 15000);
    }
  }
});
