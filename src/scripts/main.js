/* JavaScript minimo: menu mobile, filtri eventi, consenso + Google Analytics. Nessuna dipendenza. */
(function () {
  'use strict';

  // --- Tema chiaro/scuro: senza scelta esplicita vale la preferenza di sistema ---
  var themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    var root = document.documentElement;
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var isDark = function () {
      return root.dataset.theme ? root.dataset.theme === 'dark' : mq.matches;
    };
    var sync = function () {
      themeBtn.setAttribute('aria-pressed', String(isDark()));
    };
    themeBtn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* storage non disponibile: la scelta vale solo per questa pagina */
      }
      sync();
    });
    if (mq.addEventListener) mq.addEventListener('change', sync);
    sync();
  }

  // --- Menu mobile -----------------------------------------------------------
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.setAttribute('data-open', String(open));
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('[data-label-open]').hidden = open;
      toggle.querySelector('[data-label-close]').hidden = !open;
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // --- Filtri eventi (miglioramento progressivo: senza JS si vede l'elenco completo) ---
  var list = document.querySelector('[data-filter-list]');
  if (list) {
    var cards = Array.prototype.slice.call(list.children);
    var status = document.querySelector('[data-filter-status]');
    var emptyBox = document.querySelector('[data-filter-empty]');
    var state = { type: '', year: '' };
    var buttons = document.querySelectorAll('[data-filter]');

    var apply = function () {
      var shown = 0;
      cards.forEach(function (card) {
        var ok =
          (!state.type || card.dataset.type === state.type) &&
          (!state.year || card.dataset.year === state.year);
        card.hidden = !ok;
        if (ok) shown += 1;
      });
      if (status) status.textContent = status.dataset.template.replace('{n}', shown);
      if (emptyBox) emptyBox.hidden = shown > 0;
    };

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.dataset.filter;
        state[name] = btn.dataset.value;
        document.querySelectorAll('[data-filter="' + name + '"]').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        apply();
      });
    });
    apply();
  }

  // --- Consenso e Google Analytics ------------------------------------------
  var script = document.currentScript || document.querySelector('script[data-ga-id]');
  var gaId = script && script.getAttribute('data-ga-id');
  var banner = document.querySelector('[data-consent]');
  if (!gaId || !banner) return;

  var KEY = 'consent-analytics';
  var read = function () {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  };
  var write = function (value) {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* storage non disponibile: la scelta vale solo per questa pagina */
    }
  };

  var loaded = false;
  var loadAnalytics = function () {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(s);
  };

  var decide = function (value) {
    write(value);
    banner.hidden = true;
    if (value === 'granted') loadAnalytics();
  };

  var current = read();
  if (current === 'granted') loadAnalytics();
  else if (current !== 'denied') banner.hidden = false;

  banner.querySelector('[data-consent-accept]').addEventListener('click', function () {
    decide('granted');
  });
  banner.querySelector('[data-consent-reject]').addEventListener('click', function () {
    decide('denied');
  });
  var reopen = document.querySelector('[data-consent-open]');
  if (reopen) {
    reopen.addEventListener('click', function () {
      banner.hidden = false;
      banner.querySelector('[data-consent-accept]').focus();
    });
  }
})();
