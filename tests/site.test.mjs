import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, pagePath, PAGE_KEYS } from '../scripts/lib/site.mjs';
import { loadEvents, loadPosts } from '../scripts/lib/content.mjs';
import { hasPlaceholder, markTodo } from '../scripts/lib/markdown.mjs';
import { buildSitemap } from '../scripts/lib/sitemap.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = loadConfig(root, {});

const keysOf = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? keysOf(v, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );

test('le tre lingue hanno le stesse chiavi di traduzione', () => {
  const [base, ...others] = Object.values(config.i18n);
  const reference = keysOf(base).sort();
  for (const other of others)
    assert.deepEqual(keysOf(other).sort(), reference, `lingua ${other.lang}`);
});

test('gli array i18n hanno la stessa lunghezza in tutte le lingue', () => {
  const [it, ...rest] = Object.values(config.i18n);
  for (const l of rest) {
    assert.equal(l.about.timeline.length, it.about.timeline.length);
    assert.equal(l.services.items.length, it.services.items.length);
    assert.equal(l.projects.items.length, it.projects.items.length);
    assert.equal(l.services.faq.length, it.services.faq.length);
  }
});

test('pagePath: italiano alla radice, altre lingue con prefisso', () => {
  assert.equal(pagePath(config, 'it', 'home'), '/');
  assert.equal(pagePath(config, 'it', 'events'), '/eventi/');
  assert.equal(pagePath(config, 'en', 'home'), '/en/');
  assert.equal(pagePath(config, 'es', 'contact'), '/es/contacto/');
  assert.equal(PAGE_KEYS.length, 9);
});

test('pagePath rispetta un base path (GitHub Pages di progetto)', () => {
  const c = loadConfig(root, { SITE_URL: 'https://utente.github.io/repo' });
  assert.equal(c.base, '/repo');
  assert.equal(pagePath(c, 'en', 'about'), '/repo/en/about/');
});

test('tutti gli eventi e gli articoli sono validi', () => {
  const events = loadEvents(path.join(root, 'src/content/events'));
  assert.ok(events.length >= 30);
  const posts = loadPosts(path.join(root, 'src/content/blog'));
  for (const p of posts) {
    assert.match(p.url, /^https:\/\/theredcode\.it\//);
    assert.match(p.date, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.ok(posts[0].date >= posts.at(-1).date);
});

test('hasPlaceholder riconosce i segnaposto nelle tre lingue, anche con testo', () => {
  assert.ok(hasPlaceholder('<p>[DA COMPLETARE] titoli</p>'));
  assert.ok(hasPlaceholder('### Ruolo · [TO COMPLETE company]'));
  assert.ok(hasPlaceholder('[POR COMPLETAR]'));
  assert.ok(!hasPlaceholder('Testo definitivo [1]'));
  assert.match(markTodo('[DA COMPLETARE] x'), /<mark class="todo">/);
});

test('sitemap: lastmod solo se presente e una voce per lingua', () => {
  const xml = buildSitemap(config, [{ key: 'blog', lastmod: '2026-11-12' }, { key: 'events' }]);
  assert.equal((xml.match(/<lastmod>/g) || []).length, 3);
  assert.equal((xml.match(/<loc>/g) || []).length, 6);
  assert.match(xml, /hreflang="x-default"/);
});
