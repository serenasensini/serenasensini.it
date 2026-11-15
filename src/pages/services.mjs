import { html } from '../../scripts/lib/html.mjs';
import { faqPage } from '../../scripts/lib/jsonld.mjs';
import { section, pageHead, steps, checklist, faq, stats } from '../components/sections.mjs';
import { bookCard } from '../components/cards.mjs';
import { badgeList, button, externalLink } from '../components/ui.mjs';
import { formatDate } from '../../scripts/lib/content.mjs';

/** Approfondimenti dal blog per un servizio (articoli reali, anche meno recenti). */
function articlesBlock(ctx, offerId) {
  const slugs = ctx.data.offerArticles[offerId];
  if (!slugs?.length) return '';
  const items = slugs.map((slug) => {
    const p = ctx.data.posts.find((x) => x.slug === slug);
    if (!p) throw new Error(`offer-articles: articolo sconosciuto "${slug}"`);
    return html`<li>${externalLink(p.url, p.title)} (${p.date.slice(0, 4)})</li>`;
  });
  return html`<h3>${ctx.t.services.articlesLabel}</h3>
    <ul class="evidence evidence--links">
      ${items}
    </ul>`;
}

/** Una sezione per servizio: testo a sinistra, temi/formati/destinatari a destra. */
function offerSection(ctx, offer, index) {
  const s = ctx.t.services;
  return section({
    id: offer.id,
    variant: index % 2 ? 'tint' : undefined,
    title: offer.title,
    lead: offer.lead,
    body: html`<div class="offer">
      <div>
        <p>${offer.text}</p>
        ${
          offer.courses
            ? html`<h3>${s.coursesLabel}</h3>
                <ul class="course-list">
                  ${offer.courses.map((c) => html`<li>${c}</li>`)}
                </ul>`
            : ''
        }
        <p><strong>${s.forLabel}:</strong> ${offer.audience}</p>
        <div class="btn-row">
          ${button({ href: '#contact', label: s.more, variant: 'secondary' })}
          ${
            offer.id === 'training'
              ? button({
                  href: `${ctx.url('projects')}#books`,
                  label: s.booksLink,
                  variant: 'secondary',
                })
              : ''
          }
          ${
            offer.id === 'speaking'
              ? button({
                  href: ctx.url('events'),
                  label: ctx.t.home.eventsLink,
                  variant: 'secondary',
                })
              : ''
          }
        </div>
      </div>
      <div>
        ${offer.groups.map(
          (g) =>
            html`<h3>${offer.groups.length > 1 ? g.title : s.topicsLabel}</h3>
              ${badgeList(g.items)}`,
        )}
        <h3>${s.formatsLabel}</h3>
        ${checklist(offer.formats)} ${articlesBlock(ctx, offer.id)}
      </div>
    </div>`,
  });
}

/** Una riga di "dove ne ho parlato": talk, articolo o libro, risolti dai dati reali (nessun testo duplicato). */
function evidenceItem(ctx, ev) {
  const a = ctx.t.services.aiAreas;
  const { events, posts, books } = ctx.data;
  if (ev.talk) {
    const e = [...events.upcoming, ...events.past, ...events.repertoire].find(
      (x) => x.slug === ev.talk,
    );
    if (!e) throw new Error(`ai-areas: talk sconosciuto "${ev.talk}"`);
    const where = e.scheduled ? `, ${e.event}, ${formatDate(e.date, ctx.t.locale)}` : '';
    return html`<li>
      <span class="evidence__kind">${e.scheduled ? a.talk : a.talkAvail}</span> “${e.title}”${where}
    </li>`;
  }
  if (ev.post) {
    const p = posts.find((x) => x.slug === ev.post);
    if (!p) throw new Error(`ai-areas: articolo sconosciuto "${ev.post}"`);
    return html`<li>
      <span class="evidence__kind">${a.article}</span> ${externalLink(p.url, p.title)}
      (${p.date.slice(0, 4)})
    </li>`;
  }
  const b = books.authored.find((x) => x.title === ev.book);
  if (!b) throw new Error(`ai-areas: libro sconosciuto "${ev.book}"`);
  return html`<li>
    <span class="evidence__kind">${a.book}</span>
    ${externalLink(b.url, `${b.title}: ${b.subtitle}`)}
  </li>`;
}

function aiAreasSection(ctx) {
  const a = ctx.t.services.aiAreas;
  return section({
    id: 'ai-areas',
    title: a.title,
    lead: a.lead,
    action: html`<a href="${ctx.url('events')}">${a.all}</a>`,
    body: ctx.data.aiAreas.groups.map(
      (g) =>
        html`<h3 class="area-group">${a.groups[g.id]}</h3>
          <div class="grid grid--2">
            ${g.items.map(
              (item) =>
                html`<article class="card">
                  <h4>${a.items[item.id].title}</h4>
                  <p>${a.items[item.id].text}</p>
                  <div>
                    <p class="card__meta"><strong>${a.where}</strong></p>
                    <ul class="evidence">
                      ${item.evidence.map((ev) => evidenceItem(ctx, ev))}
                    </ul>
                  </div>
                </article>`,
            )}
          </div>`,
    ),
  });
}

export function services(ctx) {
  const { t, site, data } = ctx;
  const s = t.services;
  const contactRows = [
    site.email && [t.contact.emailLabel, html`<a href="mailto:${site.email}">${site.email}</a>`],
    [t.contact.linkedinLabel, externalLink(site.social.linkedin, 'linkedin.com/in/serena-sensini')],
    [t.contact.githubLabel, externalLink(site.social.github, 'github.com/serenasensini')],
    site.calendar && [
      t.contact.calendarLabel,
      externalLink(site.calendar, t.contact.calendarLabel),
    ],
  ].filter(Boolean);
  return {
    key: 'services',
    title: t.meta.services.title,
    description: t.meta.services.description,
    jsonld: [
      {
        '@type': 'WebPage',
        url: ctx.abs(ctx.url('services')),
        name: t.meta.services.title,
        inLanguage: ctx.lang,
        ...(site.updated && { dateModified: site.updated }),
        about: { '@id': `${site.url}/#person` },
      },
      faqPage(s.faq),
      {
        '@type': 'ProfessionalService',
        name: `${site.name} · ${t.nav.services}`,
        url: ctx.abs(ctx.url('services')),
        provider: { '@id': `${site.url}/#person` },
        areaServed: ['IT', 'Roma', 'Remote'],
        makesOffer: s.offers.map((o) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: o.title, description: o.text },
        })),
      },
    ],
    body: html`${pageHead(ctx, {
      title: t.nav.services,
      heading: s.heading,
      intro: s.intro,
      extra: html`<nav class="toc" aria-label="${s.toc}">
        <ul>
          ${s.offers.map((o) => html`<li><a href="#${o.id}">${o.title}</a></li>`)}
          <li><a href="#ai-areas">${s.aiAreas.title}</a></li>
        </ul>
      </nav>`,
    })}
    ${s.offers.map((o, i) => offerSection(ctx, o, i))} ${aiAreasSection(ctx)}
    ${section({
      id: 'credibility',
      variant: 'tint',
      title: s.credTitle,
      lead: s.credText,
      action: externalLink(data.books.authorPage, s.credBooksAll),
      body: html`${stats(t.home.stats)}
        <h3 style="margin-top:var(--space-6)">${s.credBooks}</h3>
        <div class="grid grid--2">${data.books.authored.map((b) => bookCard(b, ctx))}</div>`,
    })}
    ${section({ id: 'process', title: s.processTitle, body: steps(s.process) })}
    ${section({ id: 'faq', variant: 'tint', title: s.faqTitle, body: faq(s.faq) })}
    ${section({
      id: 'contact',
      variant: 'dark',
      title: s.contactTitle,
      lead: s.contactText,
      body: html`<ul class="contact-list">
          ${contactRows.map(([label, link]) => html`<li><strong>${label}:</strong> ${link}</li>`)}
        </ul>
        <div class="btn-row">
          ${button({ href: site.email ? `mailto:${site.email}` : site.social.linkedin, label: site.email ? site.email : t.hero.ctaPrimary })}
          ${button({ href: ctx.url('contact'), label: t.nav.contact, variant: 'secondary' })}
        </div>
        ${
          site.updated
            ? html`<p class="page-updated">
                ${t.ui.updated}:
                <time datetime="${site.updated}">${formatDate(site.updated, t.locale)}</time>
              </p>`
            : ''
        }`,
    })}`,
  };
}
