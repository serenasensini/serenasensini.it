// Pipeline di qualità: build -> lint -> test -> accessibilità. Uso: npm run check
import { spawnSync } from 'node:child_process';

const steps = [
  ['Build', 'npm', ['run', 'build']],
  ['Lint e formattazione', 'npm', ['run', 'lint']],
  ['Test', 'npm', ['test']],
  ['Accessibilità di base', 'npm', ['run', 'check:a11y']],
  ['SEO/GEO di base', 'npm', ['run', 'check:seo']],
];

for (const [name, cmd, args] of steps) {
  console.log(`\n▶ ${name}`);
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`\n✗ Fallito: ${name}`);
    process.exit(result.status ?? 1);
  }
}
console.log(
  '\n✓ Tutti i controlli superati. Ricorda anche Lighthouse e il test manuale con tastiera/screen reader.',
);
