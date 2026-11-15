import fs from 'node:fs';
import path from 'node:path';

/** Converte il valore di una riga frontmatter (stringa JSON, array, numero, booleano). */
function parseValue(raw) {
  const v = raw.trim();
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    return inner ? inner.split(',').map((item) => parseValue(item)) : [];
  }
  if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v);
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return v;
}

export function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: source.trim() };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) throw new Error(`Frontmatter non valido: "${line}"`);
    data[line.slice(0, idx).trim()] = parseValue(line.slice(idx + 1));
  }
  return { data, body: match[2].trim() };
}

export function loadCollection(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const { data, body } = parseFrontmatter(fs.readFileSync(path.join(dir, file), 'utf8'));
      return { slug: file.replace(/\.md$/, ''), ...data, body };
    });
}

/** Una data "YYYY-MM" o "YYYY-MM-DD" -> fine del periodo (per decidere se l'evento è passato). */
export function endOfPeriod(date) {
  const [y, m, d] = String(date).split('-').map(Number);
  if (!y || !m) return null;
  return d ? new Date(y, m - 1, d, 23, 59, 59) : new Date(y, m, 0, 23, 59, 59);
}

export function startOfPeriod(date) {
  const [y, m, d] = String(date).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

const EVENT_TYPES = ['talk', 'keynote', 'lightning', 'workshop', 'panel', 'webinar'];

export function validateEvent(event) {
  const errors = [];
  if (!event.title) errors.push('title mancante');
  if (event.scheduled !== false) {
    if (!/^\d{4}-\d{2}(-\d{2})?$/.test(String(event.date ?? '')))
      errors.push('date non valida (YYYY-MM o YYYY-MM-DD)');
    if (!event.event) errors.push('event mancante');
  }
  if (event.type && !EVENT_TYPES.includes(event.type))
    errors.push(`type sconosciuto: ${event.type}`);
  return errors;
}

export function loadEvents(dir) {
  const events = loadCollection(dir).map((e) => ({
    ...e,
    scheduled: e.scheduled !== false,
    type: e.type || 'talk',
    year: e.date ? Number(String(e.date).slice(0, 4)) : null,
    tags: e.tags || [],
    langs: e.langs || [],
  }));
  for (const e of events) {
    const errors = validateEvent(e);
    if (errors.length) throw new Error(`Evento ${e.slug}: ${errors.join(', ')}`);
  }
  return events;
}

/** Divide gli eventi in prossimi (crescente), passati (decrescente) e repertorio (senza data). */
export function splitEvents(events, now = new Date()) {
  const dated = events.filter((e) => e.scheduled);
  const upcoming = dated
    .filter((e) => endOfPeriod(e.date) >= now)
    .sort((a, b) => startOfPeriod(a.date) - startOfPeriod(b.date));
  const past = dated
    .filter((e) => endOfPeriod(e.date) < now)
    .sort((a, b) => startOfPeriod(b.date) - startOfPeriod(a.date));
  const repertoire = events.filter((e) => !e.scheduled);
  return { upcoming, past, repertoire };
}

/** Eventi in evidenza: quelli con featured:true, altrimenti i prossimi, altrimenti gli ultimi passati. */
export function featuredEvents({ upcoming, past }, limit = 3) {
  const flagged = [...upcoming, ...past].filter((e) => e.featured);
  if (flagged.length) return flagged.slice(0, limit);
  return [...upcoming, ...past].slice(0, limit);
}

export function loadPosts(dir) {
  return loadCollection(dir)
    .map((p) => ({ ...p, listed: p.listed !== false }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function formatDate(date, locale) {
  const parts = String(date).split('-').map(Number);
  const [y, m, d] = parts;
  const opts = d
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat(String(locale).replace('_', '-'), opts).format(
    new Date(y, m - 1, d || 1),
  );
}

export function paginate(items, page, perPage) {
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), pages);
  return { items: items.slice((current - 1) * perPage, current * perPage), page: current, pages };
}
