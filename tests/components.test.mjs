import test from 'node:test';
import assert from 'node:assert/strict';
import { html, raw, esc, fmt } from '../scripts/lib/html.mjs';
import { pagination, field, toast, breadcrumb, emptyState } from '../src/components/ui.mjs';
import { checkHtml, contrast, readTokens, CONTRAST_PAIRS } from '../scripts/lib/a11y.mjs';
import fs from 'node:fs';

const t = { ui: { pagination: 'Paginazione', prev: 'Prec', next: 'Succ', page: 'Pagina' } };

test('html escapa le interpolazioni ma non il raw()', () => {
  assert.equal(html`<p>${'<b>&"x"'}</p>`.toString(), '<p>&lt;b&gt;&amp;&quot;x&quot;</p>');
  assert.equal(html`<p>${raw('<b>ok</b>')}</p>`.toString(), '<p><b>ok</b></p>');
  assert.equal(esc("'"), '&#39;');
  assert.equal(fmt('{n} risultati', { n: 3 }), '3 risultati');
});

test('pagination: una sola pagina non genera nulla, altrimenti marca la pagina corrente', () => {
  assert.equal(pagination({ page: 1, pages: 1, hrefFor: () => '/', t }).toString(), '');
  const out = pagination({ page: 2, pages: 3, hrefFor: (n) => `/p/${n}/`, t }).toString();
  assert.match(out, /aria-current="page"/);
  assert.match(out, /rel="prev"/);
  assert.match(out, /rel="next"/);
});

test('field associa etichetta ed errore al campo', () => {
  const out = field({
    id: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    error: 'Obbligatoria',
  }).toString();
  assert.match(out, /<label for="email">/);
  assert.match(out, /aria-invalid="true"/);
  assert.match(out, /aria-describedby="email-error"/);
  assert.match(out, /id="email-error"/);
});

test('toast usa role=alert per gli errori e role=status per i successi', () => {
  assert.match(toast({ type: 'error', message: 'x' }).toString(), /role="alert"/);
  assert.match(toast({ message: 'x' }).toString(), /role="status"/);
});

test('breadcrumb e stato vuoto', () => {
  const out = breadcrumb(
    [{ label: 'Home', href: '/' }, { label: 'Eventi' }],
    'Percorso',
  ).toString();
  assert.match(out, /aria-label="Percorso"/);
  assert.match(out, /<span aria-current="page">Eventi<\/span>/);
  assert.match(emptyState('Niente').toString(), /class="empty"/);
});

const GOOD = `<!doctype html><html lang="it"><head><title>x</title><meta name="description" content="d"><meta name="viewport" content="width=device-width"></head>
<body><a class="skip-link" href="#main">Vai</a><main id="main"><h1>T</h1><h2>S</h2><label for="a">A</label><input id="a"><img src="x.png" alt="x"></main></body></html>`;

test('checkHtml: pagina corretta senza errori', () => {
  assert.deepEqual(checkHtml(GOOD), []);
});

test('checkHtml: rileva alt mancante, campo senza etichetta, salto di titoli e link generici', () => {
  const bad = GOOD.replace('alt="x"', '')
    .replace('<label for="a">A</label>', '')
    .replace('<h2>S</h2>', '<h3>S</h3><a href="/x">clicca qui</a>');
  const errors = checkHtml(bad).join('\n');
  assert.match(errors, /senza alt/);
  assert.match(errors, /senza etichetta/);
  assert.match(errors, /salto di livello/);
  assert.match(errors, /generico/);
});

test('token di colore: tutte le coppie rispettano WCAG AA in tema chiaro e scuro', () => {
  const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
  const light = readTokens(read('../src/styles/_tokens.scss'));
  const dark = { ...light, ...readTokens(read('../src/styles/_dark.scss')) };
  assert.notEqual(dark.paper, light.paper, 'il tema scuro ridefinisce lo sfondo');
  for (const tokens of [light, dark]) {
    for (const [fg, bg, min] of CONTRAST_PAIRS) {
      assert.ok(contrast(tokens[fg], tokens[bg]) >= min, `${fg} su ${bg}`);
    }
  }
  assert.ok(contrast('#000000', '#ffffff') > 20.9);
});
