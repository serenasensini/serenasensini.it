import { html, raw } from '../../scripts/lib/html.mjs';
import { renderInline } from '../../scripts/lib/markdown.mjs';
import { formatDate } from '../../scripts/lib/content.mjs';
import { badge, badgeList, externalLink, isTodo, todoText } from './ui.mjs';

export function eventCard(event, ctx) {
  const { t } = ctx;
  const ev = t.events;
  const links = [
    event.register && [event.register, ev.register],
    event.slides && [event.slides, ev.slides],
    event.video && [event.video, ev.video],
    event.recap && [event.recap, ev.recap],
  ].filter(Boolean);
  const meta = [
    event.date && html`<time datetime="${event.date}">${formatDate(event.date, t.locale)}</time>`,
    event.event && html`<span>${event.event}</span>`,
    event.location && html`<span>${event.location}</span>`,
    event.format && html`<span>${event.format}</span>`,
    event.duration && html`<span>${t.ui.minutes.replace('{n}', event.duration)}</span>`,
  ].filter(Boolean);
  const facts = [
    event.level && ev.levels[event.level],
    event.langs.length && event.langs.map((l) => ev.langs[l]).join(' / '),
  ].filter(Boolean);
  return html`<article class="card" data-type="${event.type}" data-year="${event.year ?? ''}">
    <div><span class="badge badge--accent">${ev.types[event.type]}</span></div>
    <h3>${event.title}</h3>
    ${meta.length ? html`<p class="card__meta">${meta}</p>` : ''}
    <p>${renderInline(event.body)}</p>
    ${facts.length ? html`<p class="card__meta">${facts.map((f) => html`<span>${f}</span>`)}</p>` : ''}
    ${badgeList(event.tags)}
    ${links.length ? html`<p class="card__foot">${links.map(([href, label], i) => html`${i ? ' · ' : ''}${externalLink(href, label)}`)}</p>` : ''}
  </article>`;
}

export function postCard(post, ctx) {
  const { t } = ctx;
  return html`<article class="card">
    <p class="card__meta">
      <time datetime="${post.date}">${formatDate(post.date, t.locale)}</time
      >${post.categories?.length ? html`<span>${post.categories.join(', ')}</span>` : ''}
    </p>
    <h3>${externalLink(post.url, post.title, 'card__link')}</h3>
    <p>${post.body}</p>
    ${badgeList(post.tags)}
    <p class="card__foot visually-hidden">${t.blog.readOn}</p>
  </article>`;
}

export function projectCard(project, ctx) {
  const { t } = ctx;
  const p = t.projects;
  const todo = isTodo(project.text, project.role);
  const details = [
    [p.problemLabel, project.problem],
    [p.solutionLabel, project.solution],
    [p.roleLabel, project.role],
    [p.resultsLabel, project.results],
  ].filter(([, v]) => v);
  return html`<article class="card${todo ? ' card--todo' : ''}">
    <div>${badge(project.kind, true)}</div>
    <h3>
      ${project.link ? externalLink(project.link, project.title, 'card__link') : project.title}
    </h3>
    <p>${todoText(project.text)}</p>
    <dl>
      ${details.map(
        ([k, v]) =>
          html`<div>
            <dt>${k}</dt>
            <dd>${todoText(v)}</dd>
          </div>`,
      )}
    </dl>
    ${project.link ? html`<p class="card__foot" aria-hidden="true">${project.linkLabel} →</p>` : raw('')}
    ${
      project.links?.length
        ? html`<p class="card__foot">
            ${project.links.map((l, i) => html`${i ? ' · ' : ''}${externalLink(l.href, l.label)}`)}
          </p>`
        : ''
    }
  </article>`;
}

/** Link Amazon con tag affiliato (solo per i libri revisionati, come richiesto). */
export const affiliateUrl = (url, tag) =>
  tag && url.includes('amazon.') ? `${url}${url.includes('?') ? '&' : '?'}tag=${tag}` : url;

export function bookCard(book, ctx, { reviewed = false } = {}) {
  const b = ctx.t.projects.books;
  const tag = ctx.data.books.affiliateTag;
  const meta = [
    reviewed && html`<span>${b.by} ${book.by}</span>`,
    html`<span>${b.publisher}: ${book.publisher}</span>`,
    book.year && html`<span>${book.year}</span>`,
    html`<span>${book.pages} ${b.pages}</span>`,
    book.lang && book.lang !== 'it' && html`<span>${ctx.t.events.langs[book.lang]}</span>`,
  ].filter(Boolean);
  const href = reviewed ? affiliateUrl(book.url, tag) : book.url;
  return html`<article class="card">
    ${reviewed ? html`<div><span class="badge badge--accent">${b.role}</span></div>` : ''}
    <h3>
      ${externalLink(href, book.title, 'card__link', reviewed && tag ? 'sponsored noopener' : 'noopener')}
    </h3>
    <p>${book.subtitle}</p>
    <p class="card__meta">${meta}</p>
    <p class="card__foot" aria-hidden="true">${b.link} →</p>
  </article>`;
}

export function serviceCard(service) {
  return html`<article class="card">
    <h3>${service.title}</h3>
    <p>${service.text}</p>
    ${badgeList(service.tags)}
  </article>`;
}
