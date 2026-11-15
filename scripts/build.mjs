// Generatore statico: Markdown + JSON + template JS -> HTML in dist/. Zero framework.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { loadConfig, createContext, PAGE_KEYS } from './lib/site.mjs';
import { loadEvents, splitEvents, loadPosts } from './lib/content.mjs';
import { hasPlaceholder, renderMarkdown } from './lib/markdown.mjs';
import { buildSitemap } from './lib/sitemap.mjs';
import { buildLlms, buildRobots } from './lib/llms.mjs';
import { layout } from '../src/layouts/base.mjs';
import { home } from '../src/pages/home.mjs';
import { about } from '../src/pages/about.mjs';
import { services } from '../src/pages/services.mjs';
import { projects } from '../src/pages/projects.mjs';
import { events } from '../src/pages/events.mjs';
import { blog } from '../src/pages/blog.mjs';
import { contact } from '../src/pages/contact.mjs';
import { privacy } from '../src/pages/privacy.mjs';
import { story } from '../src/pages/story.mjs';
import { notFound } from '../src/pages/notfound.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const PAGES = { home, about, story, services, projects, events, contact, privacy };

/** lastmod solo dove c'è un segnale reale (ultimo articolo, ultimo talk); altrove si omette. */
export function lastmodFor(key, data) {
  if (key === 'blog') return data.posts[0]?.date;
  if (key === 'events') {
    const d = data.events.past[0]?.date;
    return d && d.length === 7 ? `${d}-01` : d;
  }
  return undefined;
}

const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, String(content));
};

export function build({ now = new Date() } = {}) {
  const config = loadConfig(root);
  const { site } = config;

  const data = {
    events: splitEvents(loadEvents(path.join(root, 'src/content/events')), now),
    posts: loadPosts(path.join(root, 'src/content/blog')),
    offerArticles: JSON.parse(
      fs.readFileSync(path.join(root, 'src/data/offer-articles.json'), 'utf8'),
    ),
    aiAreas: JSON.parse(fs.readFileSync(path.join(root, 'src/data/ai-areas.json'), 'utf8')),
    books: JSON.parse(fs.readFileSync(path.join(root, 'src/data/books.json'), 'utf8')),
    testimonials: JSON.parse(
      fs.readFileSync(path.join(root, 'src/data/testimonials.json'), 'utf8'),
    ),
    pages: Object.fromEntries(
      site.languages.map((lang) => [
        lang,
        Object.fromEntries(
          ['about', 'story', 'privacy'].map((name) => [
            name,
            renderMarkdown(
              fs.readFileSync(path.join(root, `src/content/pages/${lang}/${name}.md`), 'utf8'),
            ),
          ]),
        ),
      ]),
    ),
  };

  fs.rmSync(dist, { recursive: true, force: true });
  fs.cpSync(path.join(root, 'public'), dist, { recursive: true });
  write(
    path.join(dist, 'css/main.css'),
    sass.compile(path.join(root, 'src/styles/main.scss'), { style: 'compressed' }).css,
  );
  fs.cpSync(path.join(root, 'src/scripts/main.js'), path.join(dist, 'js/main.js'));

  // Percorso URL (con base) -> file in dist/
  const fileFor = (urlPath) =>
    path.join(
      dist,
      urlPath.slice(config.base.length),
      urlPath.endsWith('.html') ? '' : 'index.html',
    );

  // Prima passata: genera tutte le pagine in memoria.
  const rendered = [];
  for (const lang of site.languages) {
    const ctx = createContext(config, lang, data);
    for (const key of PAGE_KEYS) {
      rendered.push({ ctx, lang, key, page: PAGES[key] ? PAGES[key](ctx) : blog(ctx) });
    }
    // Pagine successive del blog (solo se necessarie)
    const first = blog(ctx, 1);
    for (let n = 2; n <= first.pages; n += 1)
      rendered.push({ ctx, lang, key: 'blog', page: blog(ctx, n) });
  }

  // Controllo qualità: una pagina con segnaposto resta noindex (in tutte le lingue) e fuori dalla sitemap.
  const unfinished = new Set(rendered.filter((r) => hasPlaceholder(r.page.body)).map((r) => r.key));
  for (const r of rendered) if (unfinished.has(r.key)) r.page.noindex = true;
  for (const r of rendered) write(fileFor(r.page.path ?? r.ctx.url(r.key)), layout(r.ctx, r.page));

  const indexable = PAGE_KEYS.filter((key) => !unfinished.has(key));
  const sitemapEntries = indexable.map((key) => ({ key, lastmod: lastmodFor(key, data) }));

  const ctx404 = createContext(config, site.defaultLanguage, data);
  write(path.join(dist, '404.html'), layout(ctx404, notFound(ctx404)));
  write(path.join(dist, 'sitemap.xml'), buildSitemap(config, sitemapEntries));
  write(path.join(dist, 'robots.txt'), buildRobots(config));
  write(path.join(dist, 'llms.txt'), buildLlms(config, data, now));
  return { config, data, dist, unfinished: [...unfinished] };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { data, unfinished } = build();
  const { upcoming, past, repertoire } = data.events;
  console.log(
    `Build completata in dist/ · eventi: ${upcoming.length} futuri, ${past.length} passati, ${repertoire.length} nel repertorio · articoli: ${data.posts.length}`,
  );
  if (unfinished.length) {
    console.warn(
      `⚠ Pagine con segnaposto (noindex e fuori dalla sitemap finché non sono complete): ${unfinished.join(', ')}`,
    );
  }
}
