import { html } from '../../scripts/lib/html.mjs';
import { featuredEvents } from '../../scripts/lib/content.mjs';
import { person, website } from '../../scripts/lib/jsonld.mjs';
import { hero, section, stats, ctaSection } from '../components/sections.mjs';
import { eventCard, postCard, projectCard, serviceCard } from '../components/cards.mjs';
import { externalLink, isTodo } from '../components/ui.mjs';
import { icon } from '../components/icons.mjs';

export function home(ctx) {
  const { t, data } = ctx;
  const h = t.home;
  const more = (href, label) => html`<a href="${href}">${label}</a>`;
  const projects = t.projects.items.filter((p) => !isTodo(p.text)).slice(0, 3);
  const events = featuredEvents(data.events, 3);
  return {
    key: 'home',
    title: t.meta.home.title,
    description: t.meta.home.description,
    jsonld: [person(ctx), website(ctx)],
    body: html`${hero(ctx)}
    ${section({
      id: 'intro',
      variant: 'tint',
      title: h.introTitle,
      action: more(ctx.url('story'), h.introLink),
      body: html`<p class="intro-role">${h.introRole}</p>
        <p class="section__lead">${h.introText}</p>
        ${stats(h.stats)}`,
    })}
    ${section({
      id: 'topics',
      title: h.topicsTitle,
      body: html`<ul class="topics">
        ${h.topics.map(
          (x) =>
            html`<li>
              ${icon(x.icon)}
              <h3>${x.title}</h3>
              <p>${x.text}</p>
            </li>`,
        )}
      </ul>`,
    })}
    ${section({
      id: 'services',
      variant: 'tint',
      title: h.servicesTitle,
      lead: h.servicesLead,
      action: more(ctx.url('services'), h.servicesLink),
      body: html`<div class="grid grid--2">${t.services.items.map(serviceCard)}</div>`,
    })}
    ${section({
      id: 'projects',
      title: h.projectsTitle,
      action: more(ctx.url('projects'), h.projectsLink),
      body: html`<div class="grid grid--3">${projects.map((p) => projectCard(p, ctx))}</div>`,
    })}
    ${section({
      id: 'events',
      variant: 'tint',
      title: h.eventsTitle,
      action: more(ctx.url('events'), h.eventsLink),
      body: html`<div class="grid grid--3">${events.map((e) => eventCard(e, ctx))}</div>`,
    })}
    ${section({
      id: 'blog',
      title: h.blogTitle,
      action: externalLink(ctx.site.social.blog, h.blogLink),
      body: html`<div class="grid grid--3">
        ${data.posts
          .filter((p) => p.listed)
          .slice(0, 3)
          .map((p) => postCard(p, ctx))}
      </div>`,
    })}
    ${ctaSection(ctx, { title: h.ctaTitle, text: h.ctaText, secondary: { href: ctx.url('contact'), label: t.nav.contact } })}`,
  };
}
