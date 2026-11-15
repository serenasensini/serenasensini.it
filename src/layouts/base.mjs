import { html, raw, esc } from '../../scripts/lib/html.mjs';
import { header } from '../components/header.mjs';
import { footer, consentBanner } from '../components/footer.mjs';
import { breadcrumbList } from '../../scripts/lib/jsonld.mjs';

/** Layout comune: head SEO, skip link, header, main, footer, banner consenso. */
export function layout(ctx, page) {
  const { t, site, lang } = ctx;
  const key = page.key;
  const canonical = ctx.abs(page.path ?? ctx.url(key));
  const alternates = page.noAlternates ? [] : ctx.alt(key);
  const graph = [...(page.jsonld || [])];
  if (key !== 'home' && key !== 'notFound') {
    const label = t.nav[key] ?? (key === 'privacy' ? t.footer.privacy : t.story.label);
    const parents = key === 'story' ? [{ label: t.nav.about, href: ctx.url('about') }] : [];
    graph.push(
      breadcrumbList(ctx, [
        { label: t.ui.home, href: ctx.url('home') },
        ...parents,
        { label, href: page.path ?? ctx.url(key) },
      ]),
    );
  }
  const jsonld = graph.length
    ? JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    : '';
  const ogImage = site.ogImage ? ctx.abs(ctx.asset(site.ogImage)) : '';
  return html`<!doctype html>
    <html lang="${lang}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${page.title}</title>
        <meta name="description" content="${page.description}" />
        <link rel="canonical" href="${canonical}" />
        ${alternates.map((a) => html`<link rel="alternate" hreflang="${a.lang}" href="${ctx.abs(a.href)}" />`)}
        ${alternates.length ? html`<link rel="alternate" hreflang="x-default" href="${ctx.abs(alternates.find((a) => a.lang === site.defaultLanguage).href)}" />` : ''}
        <meta property="og:type" content="${page.ogType || 'website'}" />
        <meta property="og:site_name" content="${site.name}" />
        <meta property="og:title" content="${page.title}" />
        <meta property="og:description" content="${page.description}" />
        <meta property="og:url" content="${canonical}" />
        <meta property="og:locale" content="${t.locale}" />
        ${ogImage ? html`<meta property="og:image" content="${ogImage}" />` : ''}
        <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}" />
        <meta name="twitter:title" content="${page.title}" />
        <meta name="twitter:description" content="${page.description}" />
        ${page.noindex ? raw('<meta name="robots" content="noindex">') : ''}
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#f2f2ee" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1c1515" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="${ctx.asset('favicon/favicon.svg')}" type="image/svg+xml" />
        <link
          rel="preload"
          href="${ctx.asset('fonts/fraunces-latin-wght-normal.woff2')}"
          as="font"
          type="font/woff2"
          crossorigin
        />
        <link
          rel="preload"
          href="${ctx.asset('fonts/inter-latin-wght-normal.woff2')}"
          as="font"
          type="font/woff2"
          crossorigin
        />
        <link
          rel="preload"
          href="${ctx.asset('fonts/caveat-latin-600.woff2')}"
          as="font"
          type="font/woff2"
          crossorigin
        />
        <link rel="stylesheet" href="${ctx.asset('css/main.css')}" />
        <script>
          document.documentElement.classList.add('js');
          try {
            var theme = localStorage.getItem('theme');
            if (theme === 'dark' || theme === 'light')
              document.documentElement.dataset.theme = theme;
          } catch (e) {}
        </script>
        ${jsonld ? raw(`<script type="application/ld+json">${jsonld.replaceAll('<', '\\u003c')}</script>`) : ''}
      </head>
      <body>
        <a class="skip-link" href="#main">${t.ui.skip}</a>
        ${header(ctx, key)}
        <main id="main" tabindex="-1">${page.body}</main>
        ${footer(ctx)} ${consentBanner(ctx)}
        <script
          src="${ctx.asset('js/main.js')}"
          defer${site.gaId ? raw(` data-ga-id="${esc(site.gaId)}"`) : ''}
        ></script>
      </body>
    </html> `;
}
