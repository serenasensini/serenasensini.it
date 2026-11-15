import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFrontmatter,
  splitEvents,
  endOfPeriod,
  paginate,
  formatDate,
  validateEvent,
  featuredEvents,
} from '../scripts/lib/content.mjs';

test('parseFrontmatter legge stringhe, array, numeri e booleani', () => {
  const { data, body } = parseFrontmatter(
    '---\ntitle: "Ciao: mondo"\ntags: [a, b]\nduration: 45\nscheduled: false\n---\nTesto',
  );
  assert.deepEqual(data, {
    title: 'Ciao: mondo',
    tags: ['a', 'b'],
    duration: 45,
    scheduled: false,
  });
  assert.equal(body, 'Testo');
});

test('endOfPeriod: una data mensile finisce a fine mese', () => {
  assert.equal(endOfPeriod('2026-02').getDate(), 28);
  assert.equal(endOfPeriod('2026-02-10').getDate(), 10);
});

test('splitEvents separa futuri, passati e repertorio', () => {
  const now = new Date('2026-11-15');
  const mk = (slug, date, extra = {}) => ({ slug, date, scheduled: true, ...extra });
  const { upcoming, past, repertoire } = splitEvents(
    [
      mk('a', '2026-11'),
      mk('b', '2026-12'),
      mk('c', '2025-01'),
      mk('d', '2026-10'),
      mk('r', undefined, { scheduled: false }),
    ],
    now,
  );
  assert.deepEqual(
    upcoming.map((e) => e.slug),
    ['a', 'b'],
  );
  assert.deepEqual(
    past.map((e) => e.slug),
    ['d', 'c'],
  );
  assert.deepEqual(
    repertoire.map((e) => e.slug),
    ['r'],
  );
});

test('featuredEvents preferisce featured:true, poi i prossimi, poi gli ultimi', () => {
  const split = {
    upcoming: [{ slug: 'u' }],
    past: [{ slug: 'p1', featured: true }, { slug: 'p2' }],
  };
  assert.deepEqual(
    featuredEvents(split).map((e) => e.slug),
    ['p1'],
  );
  assert.deepEqual(
    featuredEvents({ upcoming: [{ slug: 'u' }], past: [{ slug: 'p' }] }).map((e) => e.slug),
    ['u', 'p'],
  );
});

test('validateEvent segnala dati mancanti o errati', () => {
  assert.deepEqual(validateEvent({ title: 'x', date: '2026-05', event: 'Conf', type: 'talk' }), []);
  assert.ok(validateEvent({ title: 'x', date: '05/2026', event: 'Conf' }).length > 0);
  assert.ok(validateEvent({ title: 'x', date: '2026-05', event: 'Conf', type: 'boh' }).length > 0);
  assert.deepEqual(validateEvent({ title: 'x', scheduled: false }), []);
});

test("paginate limita la pagina all'intervallo valido", () => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  assert.equal(paginate(items, 3, 10).items.length, 5);
  assert.equal(paginate(items, 99, 10).page, 3);
  assert.equal(paginate([], 1, 10).pages, 1);
});

test('formatDate gestisce precisione mensile e giornaliera', () => {
  assert.match(formatDate('2026-06', 'it_IT'), /giugno 2026/);
  assert.match(formatDate('2026-06-03', 'en_GB'), /3 June 2026/);
});
