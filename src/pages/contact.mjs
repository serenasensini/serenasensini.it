import { html } from '../../scripts/lib/html.mjs';
import { person } from '../../scripts/lib/jsonld.mjs';
import { section, pageHead, checklist } from '../components/sections.mjs';
import { button, externalLink, todoText } from '../components/ui.mjs';

export function contact(ctx) {
  const { t, site } = ctx;
  const c = t.contact;
  const row = (label, content) => html`<li><strong>${label}:</strong> ${content}</li>`;
  return {
    key: 'contact',
    title: t.meta.contact.title,
    description: t.meta.contact.description,
    jsonld: [person(ctx)],
    body: html`${pageHead(ctx, { title: t.nav.contact, intro: c.intro })}
    ${section({
      id: 'channels',
      title: c.channelsTitle,
      body: html`<div class="btn-row" style="margin-bottom:var(--space-6)">
          ${button({ href: site.social.linkedin, label: c.ctaPrimary })}
        </div>
        <ul class="contact-list">
          ${row(c.emailLabel, site.email ? html`<a href="mailto:${site.email}">${site.email}</a>` : todoText(c.emailMissing))}
          ${site.calendar ? row(c.calendarLabel, externalLink(site.calendar, c.calendarLabel)) : ''}
          ${row(c.linkedinLabel, externalLink(site.social.linkedin, 'linkedin.com/in/serena-sensini'))}
          ${row(c.githubLabel, externalLink(site.social.github, 'github.com/serenasensini'))}
          ${row(c.blogLabel, externalLink(site.social.blog, 'theredcode.it'))}
          ${row(c.emblemaLabel, externalLink(site.social.emblema, 'emblema.live/speaker/ssensini'))}
          ${site.otherChannels.map((o) => row(o.label, externalLink(o.url, o.url)))}
        </ul>`,
    })}
    ${section({
      id: 'services',
      title: c.servicesTitle,
      lead: c.servicesIntro,
      body: html`<ul class="toc-list">
        ${t.services.offers.map(
          (o) => html`<li><a href="${ctx.url('services')}#${o.id}">${o.title}</a></li>`,
        )}
        <li><a href="${ctx.url('services')}#ai-areas">${t.services.aiAreas.title}</a></li>
      </ul>`,
    })}
    ${section({
      id: 'availability',
      variant: 'tint',
      title: c.availabilityTitle,
      lead: c.availability,
      body: checklist(c.areas),
    })}
    ${section({
      id: 'message',
      title: c.messageTitle,
      lead: c.messageIntro,
      body: checklist(c.tips),
    })}`,
  };
}
