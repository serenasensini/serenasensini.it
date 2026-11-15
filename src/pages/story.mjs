import { html } from '../../scripts/lib/html.mjs';
import { person } from '../../scripts/lib/jsonld.mjs';
import { section, pageHead, ctaSection } from '../components/sections.mjs';

/** Pagina "Il mio percorso": testo lungo in src/content/pages/<lingua>/story.md. */
export function story(ctx) {
  const { t, data, lang } = ctx;
  return {
    key: 'story',
    title: t.meta.story.title,
    description: t.meta.story.description,
    jsonld: [
      person(ctx),
      {
        '@type': 'ProfilePage',
        url: ctx.abs(ctx.url('story')),
        mainEntity: { '@id': `${ctx.site.url}/#person` },
      },
    ],
    body: html`${pageHead(ctx, {
      title: t.story.label,
      parents: [{ label: t.nav.about, href: ctx.url('about') }],
    })}
    ${section({ id: 'story', body: html`<div class="prose">${data.pages[lang].story}</div>` })}
    ${ctaSection(ctx, { title: t.story.ctaTitle, text: t.story.ctaText, secondary: { href: ctx.url('contact'), label: t.nav.contact } })}`,
  };
}
