import { html } from '../../scripts/lib/html.mjs';
import { section, pageHead } from '../components/sections.mjs';

export function privacy(ctx) {
  const { t, data, lang } = ctx;
  return {
    key: 'privacy',
    title: t.meta.privacy.title,
    description: t.meta.privacy.description,
    body: html`${pageHead(ctx, { title: t.footer.privacy })}
    ${section({
      id: 'policy',
      body: html`<div class="prose">${data.pages[lang].privacy}</div>
        <p><a href="${ctx.url('home')}">${t.privacy.backHome}</a></p>`,
    })}`,
  };
}
