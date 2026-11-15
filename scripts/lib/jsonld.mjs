import { startOfPeriod } from './content.mjs';

export const person = (ctx) => ({
  '@type': 'Person',
  '@id': `${ctx.site.url}/#person`,
  name: ctx.site.name,
  url: ctx.site.url,
  jobTitle: ctx.t.footer.role.split(', '),
  worksFor: { '@type': 'Organization', name: 'Welyk' },
  description: ctx.t.meta.home.description,
  knowsAbout: [
    ...ctx.t.about.skillGroups.flatMap((g) => g.items),
    ...Object.values(ctx.t.services.aiAreas.items).map((i) => i.title),
  ],
  knowsLanguage: ['it', 'es', 'en', 'fr'],
  homeLocation: {
    '@type': 'Place',
    address: { '@type': 'PostalAddress', addressLocality: 'Roma', addressCountry: 'IT' },
  },
  hasCredential: ctx.t.about.education.map((e) => ({
    '@type': 'EducationalOccupationalCredential',
    name: e.year ? `${e.degree} (${e.year})` : e.degree,
    credentialCategory: 'degree',
    recognizedBy: { '@type': 'CollegeOrUniversity', name: 'Università degli Studi di Roma Tre' },
  })),
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Università degli Studi di Roma Tre' },
  sameAs: Object.values(ctx.site.social),
  ...(ctx.site.email && { email: ctx.site.email }),
  ...(ctx.site.photos?.hero && {
    image: ctx.abs(
      ctx.asset(`${ctx.site.photos.hero.base}-${Math.max(...ctx.site.photos.hero.widths)}.webp`),
    ),
  }),
});

export const website = (ctx) => ({
  '@type': 'WebSite',
  '@id': `${ctx.site.url}/#website`,
  url: ctx.site.url,
  name: ctx.site.name,
  inLanguage: ctx.lang,
  publisher: { '@id': `${ctx.site.url}/#person` },
});

export const organizationTheRedCode = (ctx) => ({
  '@type': 'Organization',
  name: 'TheRedCode.it',
  url: ctx.site.social.blog,
  founder: { '@id': `${ctx.site.url}/#person` },
});

export const blog = (ctx, posts) => ({
  '@type': 'Blog',
  name: 'TheRedCode.it',
  url: ctx.site.social.blog,
  blogPost: posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    url: p.url,
    datePublished: p.date,
    description: p.body,
    inLanguage: 'it',
    keywords: [...(p.categories || []), ...(p.tags || [])].join(', '),
    author: { '@id': `${ctx.site.url}/#person` },
  })),
});

/** Book: dati da src/data/books.json (titoli verificati su Amazon). */
export const bookLd = (ctx, book, { reviewed = false } = {}) => ({
  '@type': 'Book',
  name: book.subtitle ? `${book.title}: ${book.subtitle}` : book.title,
  url: book.url,
  inLanguage: book.lang || 'it',
  numberOfPages: book.pages,
  ...(book.isbn && { isbn: book.isbn }),
  ...(book.year && { datePublished: String(book.year) }),
  // Libri propri: autrice. Libri revisionati: l'autore è un altro, Serena è contributor (revisione e prefazione).
  author: reviewed ? { '@type': 'Person', name: book.by } : { '@id': `${ctx.site.url}/#person` },
  ...(reviewed && { contributor: { '@id': `${ctx.site.url}/#person` } }),
  publisher: {
    '@type': 'Organization',
    name: book.publisher,
    ...(ctx.data.books.publishers?.[book.publisher] && {
      url: ctx.data.books.publishers[book.publisher],
    }),
  },
});

/** Podcast Edicola Cloud: co-host insieme ad Andrea Saltarello. */
export const podcastSeries = (ctx) => ({
  '@type': 'PodcastSeries',
  name: 'Edicola Cloud',
  url: 'https://open.spotify.com/show/5Bs7fIw4lkuRJAiKMblapo',
  inLanguage: 'it',
  description: 'Podcast di notizie cloud e tech.',
  actor: [{ '@id': `${ctx.site.url}/#person` }, { '@type': 'Person', name: 'Andrea Saltarello' }],
});

/** FAQPage: stesse domande e risposte visibili nella pagina Servizi. */
export const faqPage = (items) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((i) => ({
    '@type': 'Question',
    name: i.q,
    acceptedAnswer: { '@type': 'Answer', text: i.a },
  })),
});

/** BreadcrumbList: Home > [genitore] > pagina. */
export const breadcrumbList = (ctx, items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.label,
    item: ctx.abs(item.href),
  })),
});

/**
 * Event JSON-LD per un talk. Luogo e modalità si inseriscono solo se presenti nel file dell'evento:
 * non si inventano dati. Senza luogo l'evento resta valido per schema.org ma non idoneo ai rich result.
 */
export function eventLd(ctx, event) {
  const online = event.format === 'online';
  return {
    '@type': 'Event',
    name: event.title,
    startDate: startOfPeriod(event.date)
      .toISOString()
      .slice(0, event.date.length === 7 ? 7 : 10),
    superEvent: { '@type': 'Event', name: event.event },
    performer: { '@id': `${ctx.site.url}/#person` },
    description: event.body,
    inLanguage: event.langs,
    ...(online && {
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      location: { '@type': 'VirtualLocation', url: event.url },
    }),
    ...(!online &&
      event.location && {
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: event.location },
      }),
  };
}
