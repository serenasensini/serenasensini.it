// Verifica SEO/GEO di base su dist/: meta, canonical, hreflang, JSON-LD valido, llms.txt, robots, sitemap.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

const errors = [];
const files = walk(dist).filter((f) => f.endsWith('.html'));
const titles = new Map();

for (const file of files) {
  const rel = path.relative(dist, file);
  const src = fs.readFileSync(file, 'utf8');
  const err = (m) => errors.push(`${rel}: ${m}`);
  const title = src.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = src.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  if (title.length < 15 || title.length > 70) err(`title di ${title.length} caratteri (15–70)`);
  if (desc.length < 70 || desc.length > 170)
    err(`description di ${desc.length} caratteri (70–170)`);
  if (titles.has(title)) err(`title duplicato con ${titles.get(title)}`);
  titles.set(title, rel);
  if (rel === '404.html') continue;
  if ((src.match(/<link rel="canonical"/g) || []).length !== 1) err('serve un solo canonical');
  for (const p of ['og:title', 'og:description', 'og:url', 'og:type']) {
    if (!src.includes(`property="${p}"`)) err(`manca ${p}`);
  }
  if (!src.includes('name="twitter:card"')) err('manca twitter:card');
  if (!src.includes('data-theme-toggle')) err('manca il pulsante del tema');
  if (!/hreflang="x-default"/.test(src)) err('manca hreflang x-default');
  const ld = [...src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!ld.length) err('manca JSON-LD');
  for (const [, json] of ld) {
    try {
      const data = JSON.parse(json);
      if (data['@context'] !== 'https://schema.org') err('JSON-LD senza @context schema.org');
    } catch (e) {
      err(`JSON-LD non valido: ${e.message}`);
    }
  }
}

const sitemapSrc = fs.existsSync(path.join(dist, 'sitemap.xml'))
  ? fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  : '';
const siteUrl = /<loc>(https?:\/\/[^/<]+)/.exec(sitemapSrc)?.[1];
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file);
  if (rel !== '404.html' && /name="robots" content="noindex"/.test(src)) {
    const loc = `${siteUrl}/${rel.replace(/index\.html$/, '')}`;
    if (sitemapSrc.includes(`<loc>${loc}</loc>`))
      errors.push(`${rel}: noindex ma presente nella sitemap`);
  }
}

const robots = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8');
if (!/Sitemap: https?:\/\//.test(robots)) errors.push('robots.txt senza Sitemap');
if (/Disallow:\s*\/\s*$/m.test(robots)) errors.push('robots.txt blocca tutto il sito');
if (!fs.existsSync(path.join(dist, 'sitemap.xml'))) errors.push('manca sitemap.xml');
const llms = fs.existsSync(path.join(dist, 'llms.txt'))
  ? fs.readFileSync(path.join(dist, 'llms.txt'), 'utf8')
  : '';
if (!llms.startsWith('# ')) errors.push('llms.txt mancante o senza titolo H1');

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n✗ ${errors.length} problemi SEO/GEO`);
  process.exit(1);
}
console.log(
  `✓ SEO/GEO di base OK: ${files.length} pagine, JSON-LD valido, llms.txt, robots.txt, sitemap.xml`,
);
