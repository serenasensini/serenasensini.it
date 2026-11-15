import { html } from '../../scripts/lib/html.mjs';
import { person } from '../../scripts/lib/jsonld.mjs';
import { section, pageHead, timeline, ctaSection } from '../components/sections.mjs';
import { badgeList, button, photo, quote } from '../components/ui.mjs';
import { icon } from '../components/icons.mjs';

export function about(ctx) {
  const { t, data, lang } = ctx;
  const a = t.about;
  const testimonials = data.testimonials.filter((x) => x.text?.[lang]);
  return {
    key: 'about',
    title: t.meta.about.title,
    description: t.meta.about.description,
    jsonld: [person(ctx)],
    body: html`${pageHead(ctx, { title: t.nav.about })}
    ${section({
      id: 'bio',
      body: html`<div class="bio">
        <div class="prose">
          ${data.pages[lang].about}
          <p><a href="${ctx.url('story')}">${t.home.introLink}</a></p>
        </div>
        ${photo(ctx, 'about', {
          alt: t.ui.photoAboutAlt,
          sizes: '(min-width: 1024px) 20rem, 90vw',
          ratio: '4 / 3',
        })}
      </div>`,
    })}
    ${section({
      id: 'facts',
      variant: 'tint',
      title: a.factsTitle,
      body: html`<dl class="facts">
        ${a.facts.map(
          ([k, v]) =>
            html`<div>
              <dt>${k}</dt>
              <dd>${v}</dd>
            </div>`,
        )}
      </dl>`,
    })}
    ${section({
      id: 'skills',
      title: a.skillsTitle,
      body: html`<div class="grid grid--3">
          ${a.skillGroups.map(
            (g) =>
              html`<div>
                <h3>${g.title}</h3>
                ${badgeList(g.items)}
              </div>`,
          )}
        </div>
        <p style="margin-top:var(--space-5)">
          <strong>${a.languagesTitle}:</strong> ${a.languagesText}
        </p>`,
    })}
    ${section({ id: 'path', variant: 'tint', title: a.pathTitle, body: timeline(a.timeline) })}
    ${section({
      id: 'values',
      title: a.valuesTitle,
      body: html`<div class="grid grid--3">
        ${a.values.map(
          (v) =>
            html`<article class="card">
              <h3>${v.title}</h3>
              <p>${v.text}</p>
            </article>`,
        )}
      </div>`,
    })}
    ${section({
      id: 'hobbies',
      variant: 'tint',
      title: a.hobbiesTitle,
      body: html`<div class="hobbies">
        ${icon('book')}${icon('plane')}
        <p>${a.hobbiesText}</p>
      </div>`,
    })}
    ${section({
      id: 'testimonials',
      title: a.testimonialsTitle,
      body: testimonials.length
        ? html`<div class="grid grid--2">
            ${testimonials.map((x) => quote({ text: x.text[lang], author: x.author, role: x.role }))}
          </div>`
        : html`<p class="section__lead">${a.testimonialsPointer}</p>
            <div class="btn-row">
              ${button({ href: ctx.site.social.linkedin, label: t.contact.linkedinLabel, variant: 'secondary' })}
              ${button({ href: ctx.site.social.emblema, label: t.contact.emblemaLabel, variant: 'secondary' })}
            </div>`,
    })}
    ${ctaSection(ctx, { title: a.ctaTitle, text: a.ctaText, secondary: { href: ctx.url('contact'), label: t.nav.contact } })}`,
  };
}
