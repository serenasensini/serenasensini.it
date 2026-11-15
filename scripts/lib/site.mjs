import fs from 'node:fs';
import path from 'node:path';

export const PAGE_KEYS = [
  'home',
  'about',
  'story',
  'services',
  'projects',
  'events',
  'blog',
  'contact',
  'privacy',
];
export const NAV_KEYS = ['about', 'story', 'services', 'projects', 'events', 'blog', 'contact'];

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/** Legge un file .env semplice (KEY=value) senza dipendenze; le variabili di processo hanno la precedenza. */
export function loadEnv(root, env = process.env) {
  const file = path.join(root, '.env');
  const fromFile = {};
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !line.trim().startsWith('#')) fromFile[m[1]] = m[2];
    }
  }
  return { ...fromFile, ...env };
}

export function loadConfig(root, env = process.env) {
  const vars = loadEnv(root, env);
  const site = readJson(path.join(root, 'src/data/site.json'));
  const url = (vars.SITE_URL || site.url).replace(/\/$/, '');
  const i18n = Object.fromEntries(
    site.languages.map((lang) => [lang, readJson(path.join(root, `src/data/i18n/${lang}.json`))]),
  );
  return {
    site: { ...site, url, gaId: vars.GA_MEASUREMENT_ID || site.gaId },
    base: new URL(url).pathname.replace(/\/$/, ''),
    i18n,
  };
}

/** Percorso (con base) di una pagina in una lingua. Italiano alla radice, altre lingue in /<lang>/. */
export function pagePath(config, lang, key) {
  const slug = config.i18n[lang].paths[key];
  const prefix = lang === config.site.defaultLanguage ? '' : `/${lang}`;
  const tail = slug ? `/${slug}/` : '/';
  return `${config.base}${prefix}${tail}`.replace(/\/{2,}/g, '/') || '/';
}

export function createContext(config, lang, data) {
  const t = config.i18n[lang];
  return {
    lang,
    t,
    site: config.site,
    config,
    data,
    url: (key) => pagePath(config, lang, key),
    abs: (p) => `${config.site.url}${p.startsWith(config.base) ? p.slice(config.base.length) : p}`,
    asset: (p) => `${config.base}/${p.replace(/^\//, '')}`,
    alt: (key) =>
      config.site.languages.map((l) => ({
        lang: l,
        name: config.i18n[l].langName,
        href: pagePath(config, l, key),
      })),
  };
}
