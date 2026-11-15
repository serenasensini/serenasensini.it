import { pagePath } from './site.mjs';

const abs = (config, p) => `${config.site.url}${p.slice(config.base.length)}`;

export function buildSitemap(config, entries) {
  const { languages, defaultLanguage } = config.site;
  const urls = entries.map(({ key, lastmod }) => {
    const alts = languages.map((l) => ({ l, href: abs(config, pagePath(config, l, key)) }));
    return languages
      .map((lang) => {
        const loc = abs(config, pagePath(config, lang, key));
        const links = [
          ...alts.map(
            (a) => `    <xhtml:link rel="alternate" hreflang="${a.l}" href="${a.href}"/>`,
          ),
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${alts.find((a) => a.l === defaultLanguage).href}"/>`,
        ].join('\n');
        const mod = lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '';
        return `  <url>\n    <loc>${loc}</loc>\n${mod}${links}\n  </url>`;
      })
      .join('\n');
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}
