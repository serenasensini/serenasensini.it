import { html } from '../../scripts/lib/html.mjs';
import { bookLd, organizationTheRedCode, podcastSeries } from '../../scripts/lib/jsonld.mjs';
import { section, pageHead } from '../components/sections.mjs';
import { bookCard, projectCard } from '../components/cards.mjs';
import { externalLink } from '../components/ui.mjs';

export function projects(ctx) {
  const { t } = ctx;
  return {
    key: 'projects',
    title: t.meta.projects.title,
    description: t.meta.projects.description,
    jsonld: [
      organizationTheRedCode(ctx),
      podcastSeries(ctx),
      ...ctx.data.books.authored.map((b) => bookLd(ctx, b)),
      ...ctx.data.books.reviewed.map((b) => bookLd(ctx, b, { reviewed: true })),
    ],
    body: html`${pageHead(ctx, { title: t.nav.projects, intro: t.projects.intro })}
    ${section({ id: 'list', title: t.home.projectsTitle, body: html`<div class="grid grid--2">${t.projects.items.map((p) => projectCard(p, ctx))}</div>` })}
    ${section({
      id: 'books',
      variant: 'tint',
      title: t.projects.books.title,
      lead: t.projects.books.intro,
      action: html`<a href="${ctx.url('services')}#training">${t.projects.books.courses}</a> ·
        ${externalLink(ctx.data.books.authorPage, t.projects.books.all)}`,
      body: html`<div class="grid grid--2">
          ${ctx.data.books.authored.map((b) => bookCard(b, ctx))}
        </div>
        <h3 style="margin-top:var(--space-6)">${t.projects.books.reviewedTitle}</h3>
        <div class="grid grid--2">
          ${ctx.data.books.reviewed.map((b) => bookCard(b, ctx, { reviewed: true }))}
        </div>
        <p class="disclosure">${t.projects.books.disclosure}</p>`,
    })}`,
  };
}
