import { html, raw } from '../../scripts/lib/html.mjs';
import { button, photo, todoText } from './ui.mjs';

/** Sezione di contenuto: variant "tint" | "dark" | undefined. */
export function section({ id, title, variant, lead, action, body }) {
  const cls = `section${variant ? ` section--${variant}` : ''}`;
  return html`<section
    class="${cls}"
    ${id ? raw(` id="${id}"`) : ''}${id && title ? raw(` aria-labelledby="${id}-title"`) : ''}
  >
    <div class="container">
      ${
        title
          ? html`<div class="section__head">
              <h2 id="${id}-title">${title}</h2>
              ${action || ''}
            </div>`
          : ''
      }
      ${lead ? html`<p class="section__lead">${lead}</p>` : ''} ${body}
    </div>
  </section>`;
}

export function hero(ctx) {
  const { t, site } = ctx;
  const portrait =
    photo(ctx, 'hero', {
      alt: t.ui.photoAlt,
      sizes: '(min-width: 1024px) 22rem, 90vw',
      eager: true,
      priority: true,
    }) || html`<div class="monogram" aria-hidden="true">S</div>`;
  return html`<section class="hero" aria-labelledby="hero-title">
    <div class="container hero__grid">
      <div>
        <p class="eyebrow">${t.hero.eyebrow}</p>
        <h1 id="hero-title">${site.name} <span class="hero__role">${t.hero.role}</span></h1>
        <p class="hero__value">${t.hero.value}</p>
        <div class="btn-row">
          ${button({ href: site.social.linkedin, label: t.hero.ctaPrimary })}
          ${button({ href: ctx.url('projects'), label: t.hero.ctaSecondary, variant: 'secondary' })}
        </div>
        <p class="hero__meta">${t.hero.location}</p>
      </div>
      ${portrait}
    </div>
  </section>`;
}

export const stats = (items) =>
  html`<ul class="stats">
    ${items.map((s) => html`<li><strong>${s.value}</strong><span>${s.label}</span></li>`)}
  </ul>`;

export const timeline = (items) =>
  html`<ol class="timeline">
    ${items.map(
      (i) =>
        html`<li>
          <span class="timeline__when">${i.when}</span>
          <h3>${i.title}</h3>
          <p>${todoText(i.text)}</p>
        </li>`,
    )}
  </ol>`;

export const steps = (items) =>
  html`<ol class="steps">
    ${items.map(
      (i) =>
        html`<li>
          <h3>${i.title}</h3>
          <p>${i.text}</p>
        </li>`,
    )}
  </ol>`;

export const checklist = (items) =>
  html`<ul class="checklist">
    ${items.map((i) => html`<li>${i}</li>`)}
  </ul>`;

export const faq = (items) =>
  html`<div class="faq">
    ${items.map(
      (i) =>
        html`<details>
          <summary>${i.q}</summary>
          <p>${i.a}</p>
        </details>`,
    )}
  </div>`;

/** CTA finale su fondo scuro. */
export const ctaSection = (ctx, { title, text, secondary }) =>
  section({
    id: 'cta',
    variant: 'dark',
    title,
    lead: text,
    body: html`<div class="btn-row">
      ${button({ href: ctx.site.social.linkedin, label: ctx.t.hero.ctaPrimary })}
      ${secondary ? button({ href: secondary.href, label: secondary.label, variant: 'secondary' }) : ''}
    </div>`,
  });

import { breadcrumb } from './ui.mjs';

/** Testata di pagina con breadcrumb, h1 e introduzione. */
export const pageHead = (ctx, { title, heading, intro, extra, parents = [] }) =>
  html`<header class="page-head">
    <div class="container">
      ${breadcrumb(
        [{ label: ctx.t.ui.home, href: ctx.url('home') }, ...parents, { label: title }],
        ctx.t.ui.breadcrumb,
      )}
      <h1>${heading ?? title}</h1>
      ${intro ? html`<p>${intro}</p>` : ''} ${extra || ''}
    </div>
  </header>`;
