// Core UI enhancements for the portfolio
// Features:
// - Mobile nav toggle with ARIA updates and ESC-to-close
// - Close nav on link click
// - Smooth scrolling for in-page anchors
// - Auto-fill current year in footer
// - Reveal-on-scroll using IntersectionObserver
// - Subtle avatar parallax (respects prefers-reduced-motion)

(function () {
    'use strict';

    // Helpers
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // NAV TOGGLE
    const navToggle = document.getElementById('navToggle');
    const siteNav = document.getElementById('siteNav');

    function openNav() {
        siteNav.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        if (expanded) closeNav(); else openNav();
    });

    // Close nav when a link is clicked (mobile)
    $$('#siteNav a').forEach(a => a.addEventListener('click', () => {
        if (siteNav.classList.contains('open')) closeNav();
    }));

    // ESC to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && siteNav.classList.contains('open')) closeNav();
    });

    // Close nav when clicking/touching outside it
    function isClickInsideNav(event) {
        // Use composedPath when available to handle Shadow DOM and better hit-testing
        const path = event.composedPath ? event.composedPath() : (event.path || []);
        if (path && path.length) {
            return path.includes(siteNav) || path.includes(navToggle);
        }
        // Fallback
        return siteNav.contains(event.target) || navToggle.contains(event.target);
    }

    function onPointerDownOutside(event) {
        if (!siteNav.classList.contains('open')) return;
        if (isClickInsideNav(event)) return;
        closeNav();
    }

    // Prefer pointer events, fall back to touchstart for older browsers
    document.addEventListener('pointerdown', onPointerDownOutside);
    document.addEventListener('touchstart', onPointerDownOutside, { passive: true });

    // SMOOTH SCROLL for in-page anchors (custom animation so we can control duration)
    // Respect user preference for reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Duration in milliseconds for the custom scroll. Increase to slow down more.
    const SCROLL_DURATION = 1000;

    // easing function (easeInOutCubic)
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animateScrollTo(targetY, duration = SCROLL_DURATION) {
        const startY = window.pageYOffset;
        const diff = targetY - startY;
        if (!diff || duration <= 0) {
            window.scrollTo(0, targetY);
            return Promise.resolve();
        }
        let startTime = null;
        return new Promise(resolve => {
            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const t = Math.min(1, elapsed / duration);
                const eased = easeInOutCubic(t);
                window.scrollTo(0, Math.round(startY + diff * eased));
                if (elapsed < duration) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            }
            requestAnimationFrame(step);
        });
    }

    // For in-page anchors, intercept clicks and animate the scroll (unless user prefers reduced motion)
    $$("a[href^='#']").forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#' || href === '#0') return;
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(href);
            if (!target) return;
            if (prefersReduced) return; // let native behavior occur for reduced-motion users
            e.preventDefault();
            const headerOffset = 80; // adjust if header height changes
            const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset;
            animateScrollTo(offsetPosition).then(() => {
                // Update focus for accessibility after the animation completes
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
                target.removeAttribute('tabindex');
            });
        });
    });

    // FOOTER YEAR
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // REVEAL ON SCROLL
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
        reveals.forEach(r => obs.observe(r));
    } else {
        // Fallback: reveal immediately
        reveals.forEach(r => r.classList.add('revealed'));
    }

    // AVATAR PARALLAX (subtle) — only on pointer devices and when motion OK
    const avatar = $('.avatar');
    if (avatar && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
        const maxTilt = 8; // px vertical movement
        const rect = avatar.getBoundingClientRect();
        let cx = rect.left + rect.width / 2;
        let cy = rect.top + rect.height / 2;

        function onMove(e) {
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const y = e.clientY || (e.touches && e.touches[0].clientY);
            const dx = (x - cx) / window.innerWidth;
            const dy = (y - cy) / window.innerHeight;
            const tx = dx * maxTilt;
            const ty = dy * maxTilt;
            avatar.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.02)`;
        }

        function reset() {
            avatar.style.transform = '';
        }

        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('mouseleave', reset);
        window.addEventListener('blur', reset);
        window.addEventListener('resize', () => {
            const r = avatar.getBoundingClientRect();
            cx = r.left + r.width / 2;
            cy = r.top + r.height / 2;
        });
    }

})();
