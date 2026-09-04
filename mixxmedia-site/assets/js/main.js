/* MixxMedia — site behaviour. Progressive: everything works without it. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* Mobile nav ---------------------------------------------------------- */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.getElementById('nav-links');

  if (toggle && links) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      links.setAttribute('data-open', String(open));
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reset state when we cross back to the desktop layout.
    var wide = window.matchMedia('(min-width: 60rem)');
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener('change', onChange);
    else if (wide.addListener) wide.addListener(onChange);
  }

  /* Header shadow on scroll --------------------------------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    header.parentNode.insertBefore(sentinel, header);

    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* Reveal on scroll ----------------------------------------------------- */
  /* A rect test rather than IntersectionObserver: anchor jumps, restored
     scroll positions, and End-key scrolling all skip past elements, and an
     observer never fires for something the viewport was never inside. */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (revealables.length) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      revealables.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
      });

      var ticking = false;
      var sweep = function () {
        ticking = false;
        var limit = window.innerHeight * 0.94;
        revealables = revealables.filter(function (el) {
          if (el.getBoundingClientRect().top >= limit) return true;
          el.classList.add('is-visible');
          return false;
        });
        if (!revealables.length) {
          window.removeEventListener('scroll', request);
          window.removeEventListener('resize', request);
        }
      };
      var request = function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(sweep);
      };

      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', request);
      sweep();
    }
  }

  /* Current year in the footer ------------------------------------------ */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
