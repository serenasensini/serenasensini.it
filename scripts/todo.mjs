// Elenca i segnaposto da completare nei contenuti (solo lingua italiana: le altre ricalcano la stessa struttura).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARK = /\[(DA COMPLETARE|TO COMPLETE|POR COMPLETAR)[^\]]*\]/;
const files = [
  'src/data/i18n/it.json',
  'src/data/site.json',
  'src/data/testimonials.json',
  'src/content/pages/it/about.md',
  'src/content/pages/it/story.md',
  'src/content/pages/it/privacy.md',
];
let count = 0;
for (const file of files) {
  fs.readFileSync(path.join(root, file), 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (MARK.test(line)) {
        count += 1;
        console.log(`${file}:${i + 1}  ${line.trim().slice(0, 100)}`);
      }
    });
}
const site = JSON.parse(fs.readFileSync(path.join(root, 'src/data/site.json'), 'utf8'));
for (const k of ['email', 'calendar', 'ogImage', 'gaId'])
  if (!site[k]) console.log(`site.json: "${k}" è vuoto`);
console.log(`\n${count} segnaposto nei testi (le stesse voci esistono in EN/ES).`);
