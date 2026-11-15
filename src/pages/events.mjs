import { html, fmt } from '../../scripts/lib/html.mjs';
import { eventLd } from '../../scripts/lib/jsonld.mjs';
import { section, pageHead } from '../components/sections.mjs';
import { eventCard } from '../components/cards.mjs';
import { emptyState, externalLink, photo } from '../components/ui.mjs';

function filters(ctx, past) {
  const { t } = ctx;
  const types = [...new Set(past.map((e) => e.type))];
  const years = [...new Set(past.map((e) => e.year))].sort((a, b) => b - a);
  const group = (name, label, options, allLabel) =>
    html`<fieldset>
      <legend>${label}</legend>
      <div class="filters__options">
        <button type="button" data-filter="${name}" data-value="" aria-pressed="true">
          ${allLabel}
        </button>
        ${options.map(([value, text]) => html`<button type="button" data-filter="${name}" data-value="${value}" aria-pressed="false">${text}</button>`)}
      </div>
    </fieldset>`;
  return html`<div class="filters js-only" role="group" aria-label="${t.events.filtersLabel}">
      ${group(
        'type',
        t.ui.filterType,
        types.map((v) => [v, t.events.types[v]]),
        t.ui.all,
      )}
      ${group(
        'year',
        t.ui.filterYear,
        years.map((y) => [y, y]),
        t.ui.allYears,
      )}
    </div>
    <p class="js-only" role="status" data-filter-status data-template="${t.ui.results}"></p>`;
}

export function events(ctx) {
  const { t, data } = ctx;
  const { upcoming, past, repertoire } = data.events;
  const ev = t.events;
  const withLd = [...upcoming, ...past].map((e) => eventLd(ctx, e)).filter(Boolean);
  return {
    key: 'events',
    title: t.meta.events.title,
    description: t.meta.events.description,
    jsonld: withLd,
    body: html`${pageHead(ctx, {
      title: t.nav.events,
      intro: ev.intro,
      extra: html`<p style="margin-top:var(--space-4)">
          ${externalLink(ctx.site.social.emblema, ev.profile)}
        </p>
        <div class="page-head__photo">
          ${photo(ctx, 'events', {
            alt: t.ui.photoEventsAlt,
            sizes: '(min-width: 1024px) 24rem, 90vw',
            ratio: '3 / 2',
            eager: true,
          })}
        </div>`,
    })}
    ${section({
      id: 'upcoming',
      title: ev.upcomingTitle,
      body: upcoming.length
        ? html`<div class="grid grid--2">${upcoming.map((e) => eventCard(e, ctx))}</div>`
        : emptyState(ev.upcomingEmpty),
    })}
    ${section({
      id: 'past',
      variant: 'tint',
      title: ev.pastTitle,
      body: html`${filters(ctx, past)}
        <div class="grid grid--2" data-filter-list>${past.map((e) => eventCard(e, ctx))}</div>
        <div class="empty" data-filter-empty hidden>${t.ui.empty}</div>`,
    })}
    ${
      repertoire.length
        ? section({
            id: 'repertoire',
            title: ev.repertoireTitle,
            lead: ev.repertoireText,
            action: html`<a href="${ctx.url('services')}#speaking">${ev.bookTalk}</a>`,
            body: html`<div class="grid grid--2">${repertoire.map((e) => eventCard(e, ctx))}</div>`,
          })
        : ''
    }`,
  };
}

export { fmt };
