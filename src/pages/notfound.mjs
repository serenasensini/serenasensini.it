import { html } from '../../scripts/lib/html.mjs';

/** 404 trilingue: GitHub Pages serve un unico 404.html alla radice. */
export function notFound(ctx) {
  const { config } = ctx;
  return {
    key: 'notFound',
    path: `${config.base}/404.html`,
    title: ctx.t.meta.notFound.title,
    description: ctx.t.meta.notFound.description,
    noindex: true,
    noAlternates: true,
    body: html`<div class="container not-found">
      ${config.site.languages.map((l, i) => {
        const t = config.i18n[l];
        const home = config.base + (l === config.site.defaultLanguage ? '/' : `/${l}/`);
        return html`<section lang="${l}">
          ${i === 0 ? html`<h1>${t.notFound.title}</h1>` : html`<h2>${t.notFound.title}</h2>`}
          <p>${t.notFound.text}</p>
          <p><a class="btn" href="${home}">${t.notFound.link}</a></p>
        </section>`;
      })}
    </div>`,
  };
}
