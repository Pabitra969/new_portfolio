// Mobile navigation toggle
(function () {
    const navToggle = document.getElementById('navToggle');
    const siteNav = document.getElementById('siteNav');
    // create or reuse an overlay element for mobile blur
    let overlay = document.querySelector('.mobile-nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        document.body.appendChild(overlay);
    }

    if (!navToggle || !siteNav) return;

    function openNav() {
        siteNav.classList.add('mobile-open');
        overlay.classList.add('visible');
        navToggle.setAttribute('aria-expanded', 'true');
    }

    function closeNav() {
        siteNav.classList.remove('mobile-open');
        overlay.classList.remove('visible');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    function toggleNav() {
        if (siteNav.classList.contains('mobile-open')) {
            closeNav();
        } else {
            openNav();
        }
    }

    navToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleNav();
    });

    // Close when clicking a link inside the nav
    siteNav.addEventListener('click', function (e) {
        const target = e.target;
        if (target.tagName === 'A') {
            closeNav();
        }
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
        if (!siteNav.contains(e.target) && !navToggle.contains(e.target)) {
            closeNav();
        }
    });

    // Close when clicking the overlay
    overlay.addEventListener('click', function () {
        closeNav();
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeNav();
    });

    // Ensure correct state on resize
    window.addEventListener('resize', function () {
        if (window.innerWidth > 600) {
            // ensure nav is visible in desktop
            siteNav.classList.remove('mobile-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
})();

// Insert current year into footer
(function () {
    const yearEl = document.getElementById('year');
    if (!yearEl) return;
    const now = new Date();
    yearEl.textContent = now.getFullYear();
})();
