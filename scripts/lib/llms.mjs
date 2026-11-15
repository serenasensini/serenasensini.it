import { pagePath } from './site.mjs';
import { formatDate } from './content.mjs';

const abs = (config, p) => `${config.site.url}${p.slice(config.base.length)}`;

/** llms.txt: riepilogo del sito in Markdown per assistenti AI e motori generativi (https://llmstxt.org). */
export function buildLlms(config, data, now = new Date()) {
  const lang = config.site.defaultLanguage;
  const t = config.i18n[lang];
  const link = (l, key) => abs(config, pagePath(config, l, key));
  const page = (key, label, desc) => `- [${label}](${link(lang, key)}): ${desc}`;
  const talks = data.events.past.slice(0, 12);
  return `# ${config.site.name}

> ${t.meta.home.description}

${t.hero.value}

## ${t.about.factsTitle}

${t.about.facts.map(([k, v]) => `- ${k}: ${v}`).join('\n')}
- LinkedIn: ${config.site.social.linkedin}
- GitHub: ${config.site.social.github}
- Blog: ${config.site.social.blog}
- Talk: ${config.site.social.emblema}
${config.site.email ? `- Email: ${config.site.email}\n` : ''}
## Pagine

${page('about', t.nav.about, t.meta.about.description)}
${page('story', t.story.label, t.meta.story.description)}
${page('services', t.nav.services, t.meta.services.description)}
${page('projects', t.nav.projects, t.meta.projects.description)}
${page('events', t.nav.events, t.meta.events.description)}
${page('blog', t.nav.blog, t.meta.blog.description)}
${page('contact', t.nav.contact, t.meta.contact.description)}

## Ambiti AI\n\n${Object.values(t.services.aiAreas.items)
    .map((i) => `- ${i.title}`)
    .join('\n')}\n\n## Libri (Apogeo, Hoepli)

${data.books.authored.map((b) => `- [${b.title}: ${b.subtitle}](${b.url})`).join('\n')}

## Talk recenti

${talks.map((e) => `- ${e.title} (${e.event}, ${formatDate(e.date, t.locale)})`).join('\n')}

## Articoli recenti su TheRedCode.it

${data.posts
  .filter((p) => p.listed)
  .slice(0, 6)
  .map((p) => `- [${p.title}](${p.url}) (${p.date})`)
  .join('\n')}

## Other languages

${config.site.languages
  .filter((l) => l !== lang)
  .map((l) => `- ${config.i18n[l].langName}: ${link(l, 'home')}`)
  .join('\n')}

Aggiornato: ${now.toISOString().slice(0, 10)}
`;
}

/** robots.txt: tutto indicizzabile; crawler di ricerca/assistenti AI ammessi in modo esplicito. */
export const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
];

export const buildRobots = (config) =>
  `User-agent: *\nAllow: /\n\n${AI_CRAWLERS.map((bot) => `User-agent: ${bot}\nAllow: /\n`).join('\n')}\nSitemap: ${config.site.url}/sitemap.xml\n`;
