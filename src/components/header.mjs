import { html } from '../../scripts/lib/html.mjs';
import { NAV_KEYS } from '../../scripts/lib/site.mjs';

export function header(ctx, currentKey) {
  const { t, site } = ctx;
  return html`<header class="site-header">
    <div class="container site-header__inner">
      <a class="brand" href="${ctx.url('home')}">
        <img src="${ctx.asset('favicon/favicon.svg')}" alt="" width="32" height="32" />
        <span>${site.name}</span>
      </a>
      <button
        class="nav-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="site-nav"
        data-nav-toggle
      >
        <span data-label-open>${t.ui.menu}</span
        ><span data-label-close hidden>${t.ui.closeMenu}</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="${t.ui.mainNav}">
        <ul>
          ${NAV_KEYS.map((key) => html`<li><a href="${ctx.url(key)}" ${key === currentKey ? html` aria-current="page"` : ''}>${t.nav[key]}</a></li>`)}
        </ul>
        <ul class="lang-switch" aria-label="${t.ui.langNav}">
          ${ctx.alt(currentKey === 'notFound' ? 'home' : currentKey).map((l) => html`<li><a href="${l.href}" lang="${l.lang}" hreflang="${l.lang}" aria-label="${l.name}" ${l.lang === ctx.lang ? html` aria-current="true"` : ''}>${l.lang}</a></li>`)}
        </ul>
        <button class="theme-toggle" type="button" aria-pressed="false" data-theme-toggle>
          <span class="visually-hidden">${t.ui.darkTheme}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="8" />
            <path class="theme-toggle__fill" d="M12 4a8 8 0 0 0 0 16z" />
          </svg>
        </button>
      </nav>
    </div>
  </header>`;
}
