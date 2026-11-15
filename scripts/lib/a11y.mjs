// Controlli di accessibilità statici su HTML generato (nessuna dipendenza).
// Non sostituiscono Lighthouse / axe e la verifica manuale con tastiera e screen reader.

const GENERIC_LINKS =
  /^(clicca qui|qui|click here|here|read more|leggi di più|haz clic aquí|aquí)$/i;

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}=("([^"]*)"|'([^']*)')`));
  return m ? (m[2] ?? m[3]) : null;
};
const hasAttr = (tag, name) => new RegExp(`\\s${name}(=|\\s|>|/)`).test(tag);
const stripTags = (s) =>
  s
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z#0-9]+;/gi, 'x')
    .trim();

export function checkHtml(source, { file = '', hrefExists = () => true } = {}) {
  const errors = [];
  const err = (msg) => errors.push(`${file}: ${msg}`);
  const body = source
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '');

  if (!/<html[^>]*\slang="[a-z-]+"/.test(source)) err('manca <html lang>');
  if (!/<title>[^<]+<\/title>/.test(source)) err('manca <title>');
  if (!/<meta name="description" content="[^"]+"/.test(source)) err('manca meta description');
  if (!/<meta name="viewport"/.test(source)) err('manca meta viewport');

  const firstLink = body.match(/<a\s[^>]*>/);
  if (!firstLink || !/class="skip-link"/.test(firstLink[0]))
    err('lo skip link non è il primo elemento focalizzabile');
  if ((body.match(/<main[\s>]/g) || []).length !== 1) err('deve esserci un solo <main>');

  const headings = [...body.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  if (headings.filter((h) => h === 1).length !== 1)
    err(`servono esattamente un <h1> (trovati ${headings.filter((h) => h === 1).length})`);
  headings.forEach((level, i) => {
    if (i > 0 && level > headings[i - 1] + 1)
      err(`salto di livello nei titoli: h${headings[i - 1]} -> h${level}`);
  });

  for (const [tag] of body.matchAll(/<img\s[^>]*>/g)) {
    if (!hasAttr(tag, 'alt')) err(`immagine senza alt: ${tag.slice(0, 60)}`);
  }

  const ids = [...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) err(`id duplicati: ${[...new Set(dup)].join(', ')}`);
  for (const [tag] of body.matchAll(
    /<[a-z0-9]+\s[^>]*aria-(labelledby|describedby|controls)="[^"]+"[^>]*>/g,
  )) {
    for (const name of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
      for (const id of (attr(tag, name) || '').split(/\s+/).filter(Boolean)) {
        if (!ids.includes(id)) err(`${name} punta a un id inesistente: ${id}`);
      }
    }
  }

  for (const [tag] of body.matchAll(/<(input|select|textarea)\s[^>]*>/g)) {
    if (/type="(hidden|submit|button)"/.test(tag)) continue;
    const id = attr(tag, 'id');
    const labelled =
      hasAttr(tag, 'aria-label') ||
      hasAttr(tag, 'aria-labelledby') ||
      (id && new RegExp(`<label[^>]*for="${id}"`).test(body));
    if (!labelled) err(`campo senza etichetta: ${tag.slice(0, 60)}`);
  }

  for (const m of body.matchAll(/<a\s([^>]*)>([\s\S]*?)<\/a>/g)) {
    const text = stripTags(m[2]);
    const tag = ` ${m[1]}`;
    const label = attr(tag, 'aria-label');
    if (!text && !label && !/<img[^>]*alt="[^"]+"/.test(m[2]))
      err(`link senza testo: ${m[1].slice(0, 60)}`);
    if (GENERIC_LINKS.test(text)) err(`testo del link generico: "${text}"`);
    const href = attr(tag, 'href');
    if (href === null) err('link senza href');
    else if (href.startsWith('/') && !hrefExists(href)) err(`link interno non risolto: ${href}`);
  }

  for (const m of body.matchAll(/<button\s([^>]*)>([\s\S]*?)<\/button>/g)) {
    if (!stripTags(m[2]) && !attr(` ${m[1]}`, 'aria-label')) err('button senza nome accessibile');
  }

  return errors;
}

// --- Contrasto (WCAG 2.2 AA) -------------------------------------------------
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export function readTokens(scss) {
  return Object.fromEntries(
    [...scss.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
  );
}

/** Coppie testo/sfondo usate dal design system con la soglia minima richiesta. */
export const CONTRAST_PAIRS = [
  ['ink', 'paper', 4.5],
  ['ink', 'surface', 4.5],
  ['secondary', 'paper', 4.5],
  ['secondary', 'surface', 4.5],
  ['secondary', 'accent-soft', 4.5],
  ['accent-ink', 'paper', 4.5],
  ['accent-ink', 'surface', 4.5],
  ['accent-ink', 'accent-soft', 4.5],
  ['on-dark', 'accent', 4.5], // testo dei bottoni primari
  ['on-dark', 'dark', 4.5],
  ['link-on-dark', 'dark', 4.5],
  ['on-ink', 'ink', 4.5], // testo su bottoni secondari al passaggio, filtri attivi, paginazione
  ['on-dark', 'accent-hover', 4.5], // bottone primario al passaggio
  ['success', 'success-soft', 4.5],
  ['error', 'error-soft', 4.5],
  ['error', 'paper', 4.5],
  ['line-strong', 'paper', 3],
  ['accent', 'paper', 3], // usato per elementi grandi/decorativi, mai per testo piccolo
];
