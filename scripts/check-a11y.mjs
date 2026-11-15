// Verifica accessibilità di base su dist/ (HTML + contrasto token). Uso: npm run check:a11y
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkHtml, contrast, readTokens, CONTRAST_PAIRS } from './lib/a11y.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

const files = walk(dist).filter((f) => f.endsWith('.html'));
if (!files.length) {
  console.error('dist/ è vuota: esegui prima `npm run build`.');
  process.exit(1);
}

const hrefExists = (href) => {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return true;
  const target = path.join(dist, clean);
  return (
    fs.existsSync(target) &&
    (fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html')))
  );
};

const errors = files.flatMap((f) =>
  checkHtml(fs.readFileSync(f, 'utf8'), { file: path.relative(dist, f), hrefExists }),
);

const light = readTokens(fs.readFileSync(path.join(root, 'src/styles/_tokens.scss'), 'utf8'));
// Il tema scuro ridefinisce solo alcuni token: gli altri restano quelli del tema chiaro.
const dark = {
  ...light,
  ...readTokens(fs.readFileSync(path.join(root, 'src/styles/_dark.scss'), 'utf8')),
};
for (const [theme, tokens] of [
  ['chiaro', light],
  ['scuro', dark],
]) {
  for (const [fg, bg, min] of CONTRAST_PAIRS) {
    const ratio = contrast(tokens[fg], tokens[bg]);
    if (ratio < min)
      errors.push(`tema ${theme}, contrasto ${fg} su ${bg}: ${ratio.toFixed(2)} < ${min}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n✗ ${errors.length} problemi di accessibilità in ${files.length} pagine`);
  process.exit(1);
}
console.log(
  `✓ Accessibilità di base OK: ${files.length} pagine, ${CONTRAST_PAIRS.length} coppie di contrasto per tema (chiaro e scuro)`,
);
