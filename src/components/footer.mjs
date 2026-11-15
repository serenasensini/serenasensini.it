import { html } from '../../scripts/lib/html.mjs';
import { NAV_KEYS } from '../../scripts/lib/site.mjs';

export function footer(ctx) {
  const { t, site } = ctx;
  const year = new Date().getFullYear();
  return html`<footer class="site-footer">
    <div class="container site-footer__inner">
      <div>
        <p><strong>${site.name}</strong><br />${t.footer.role}</p>
        <p>© ${year} ${site.name}. ${t.footer.rights}<br />${t.footer.text}</p>
      </div>
      <nav aria-label="${t.ui.footerNav}">
        <h2>${t.ui.footerNav}</h2>
        <ul>
          ${NAV_KEYS.map((key) => html`<li><a href="${ctx.url(key)}">${t.nav[key]}</a></li>`)}
          <li><a href="${ctx.url('privacy')}">${t.footer.privacy}</a></li>
          ${site.gaId ? html`<li><button type="button" data-consent-open>${t.footer.cookies}</button></li>` : ''}
        </ul>
      </nav>
      <div>
        <h2>${t.contact.channelsTitle}</h2>
        <ul>
          <li>
            <a href="${site.social.linkedin}" rel="me noopener">${t.contact.linkedinLabel}</a>
          </li>
          <li><a href="${site.social.blog}" rel="noopener">${t.contact.blogLabel}</a></li>
          <li><a href="${site.social.github}" rel="me noopener">${t.contact.githubLabel}</a></li>
          <li><a href="${site.social.emblema}" rel="noopener">${t.contact.emblemaLabel}</a></li>
        </ul>
      </div>
    </div>
  </footer>`;
}

export function consentBanner(ctx) {
  const { t, site } = ctx;
  if (!site.gaId) return '';
  return html`<div
    class="consent"
    role="region"
    aria-labelledby="consent-title"
    data-consent
    hidden
  >
    <h2 id="consent-title">${t.consent.title}</h2>
    <p>${t.consent.text} <a href="${ctx.url('privacy')}">${t.consent.more}</a>.</p>
    <div class="btn-row">
      <button class="btn" type="button" data-consent-accept>${t.consent.accept}</button>
      <button class="btn btn--secondary" type="button" data-consent-reject>
        ${t.consent.reject}
      </button>
    </div>
  </div>`;
}
