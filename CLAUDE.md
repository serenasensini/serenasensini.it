# CLAUDE.md

## Scopo del progetto

Sito personale di Serena Sensini (serenasensini.it): presenta profilo e servizi, mette in evidenza eventi/talk,
rimanda al blog [TheRedCode.it](https://theredcode.it) mostrando gli ultimi articoli, e porta contatti verso LinkedIn.
Lingue: italiano (radice `/`), inglese (`/en/`), spagnolo (`/es/`). Nessun form di contatto, nessun backend.

## Stack e convenzioni

- HTML generato da un piccolo script Node (`scripts/build.mjs`) con template JS (`src/components`, `src/layouts`, `src/pages`).
- Stili in SCSS (`src/styles`), contenuti in Markdown (`src/content`), dati in JSON (`src/data`).
- JavaScript lato client minimo (`src/scripts/main.js`): menu mobile, filtri eventi, consenso + Google Analytics.
- Deploy su GitHub Pages; analytics Google Analytics 4, caricato **solo dopo il consenso**.
- Dipendenze solo di sviluppo: `sass`, `marked`, `eslint`, `prettier` e i font self-hosted `@fontsource-variable/*`.
- Codice: ES modules, Prettier (single quote, 100 colonne), ESLint. I componenti sono funzioni che restituiscono HTML via ``html`...` ``
  (escaping automatico; `raw()` solo per HTML già sicuro).
- Ogni testo visibile sta in `src/data/i18n/{it,en,es}.json`: le tre lingue devono avere le stesse chiavi (lo verifica `npm test`).
- Mai inventare contenuti personali. Dove manca un dato usa `[DA COMPLETARE]` (`[TO COMPLETE]`, `[POR COMPLETAR]`): viene evidenziato in giallo.
  Elenco dei segnaposto: `npm run todo`.

## Come aggiungere un articolo

Gli articoli vivono su TheRedCode.it; il sito ne mostra l'anteprima e rimanda lì. Crea `src/content/blog/<slug>.md`:

```md
---
title: "Titolo dell'articolo"
date: "2026-11-20"
url: "https://theredcode.it/categoria/slug/"
categories: [intelligenza-artificiale]
tags: [python, nlp]
---
Breve descrizione (una o due frasi).
```

Home e pagina Blog mostrano i più recenti per data. Oltre 12 articoli compare la paginazione.

## Come aggiungere un evento

Crea `src/content/events/<slug>.md`:

```md
---
title: "Titolo del talk"
date: "2027-03-14"          # YYYY-MM oppure YYYY-MM-DD
type: "talk"                # talk | keynote | lightning | workshop | panel | webinar
event: "Nome della conferenza"
location: "Roma"            # opzionale (abilita i dati strutturati Event)
format: "online"            # opzionale ("online" abilita VirtualLocation)
langs: [it, en]
duration: 45
level: "intermediate"       # opzionale: beginner | intermediate | advanced
tags: [ai, python]
register: "https://..."     # opzionali: register, slides, video, recap
featured: true              # opzionale: lo porta tra gli eventi in evidenza in home
---
Breve descrizione.
```

Futuro o passato si decide dalla data di **build**: il workflow GitHub ricostruisce il sito ogni lunedì.
Un talk senza data va nel «repertorio»: usa `scheduled: false` e ometti `date` ed `event`.

## Come modificare colori, font e contenuti

- Colori, font, spaziature, raggi: variabili in `src/styles/_tokens.scss` (`:root`). Dopo un cambio di colore esegui `npm test`
  e `npm run check:a11y`, che ricalcolano i contrasti WCAG.
- Tema scuro: token in `src/styles/_dark.scss` (segue la preferenza di sistema; il pulsante nell'header salva la scelta in `localStorage`, chiave `theme`). Ogni nuovo colore va definito in entrambi i temi: i contrasti si verificano con `npm run check:a11y`.
- Font: file `.woff2` in `public/fonts/` dichiarati in `src/styles/_base.scss`.
- Link, email, calendario, foto, ID Analytics: `src/data/site.json` (email e calendario vuoti = segnaposto visibile in Contatti).
- Testi: `src/data/i18n/*.json`; biografia e privacy: `src/content/pages/<lingua>/{about,privacy}.md`.
- Testimonianze: `src/data/testimonials.json` (array di `{ "text": {"it","en","es"}, "author", "role" }`). Se è vuoto, Chi sono rimanda a LinkedIn ed Emblema. Casi studio: stessa logica, la scheda in Progetti rimanda ai due profili finché non ne aggiungi uno in `i18n/*.json` > `projects.items`.
- Pagina «Il mio percorso» (voce del menu; esperienze dettagliate): `src/content/pages/<lingua>/story.md`, una sezione `###` per ruolo.
- Foto: in `site.json` > `photos` (`hero`, `about`, `events`); ogni foto è `<base>-<larghezza>.webp` in `public/images/` (es. `serena-ritratto-480.webp`, `-800.webp`) e il sito genera `srcset` da `widths`.
  Per cambiarne una, esporta le stesse larghezze in WebP (qualità ~80, senza metadati EXIF) e aggiorna `base`, `widths`, `width`, `height`. L'anteprima social è `images/og.jpg` (1200×630).

## Comandi

| Comando               | Cosa fa                                                    |
| --------------------- | ---------------------------------------------------------- |
| `npm install`         | installa le dipendenze                                     |
| `npm run dev`         | build + server su http://localhost:4321 con ricostruzione  |
| `npm run build`       | genera il sito in `dist/`                                  |
| `npm run lint`        | ESLint + controllo Prettier                                |
| `npm run format`      | formatta con Prettier                                      |
| `npm test`            | test unitari (`node --test`)                               |
| `npm run check:a11y`  | controlli di accessibilità statici su `dist/` + contrasti  |
| `npm run check:seo`   | meta, canonical, hreflang, JSON-LD, llms.txt, robots       |
| `npm run check`       | build + lint + test + a11y + SEO (usato anche in CI)       |
| `npm run todo`        | elenca i contenuti `[DA COMPLETARE]`                       |

## Libri, servizi e controllo qualità

- Libri: `src/data/books.json` (`authored` e `reviewed`, con titolo, sottotitolo, autore, editore, pagine, link Amazon pulito senza tracciamento). Compaiono in Progetti e in Servizi, con dati strutturati `Book`.
- Pagina «Lavora con me»: le sezioni per servizio sono in `i18n/*.json` > `services.offers` (temi, formati, destinatari); modifica lì i corsi e i temi.
- Ambiti AI: `src/data/ai-areas.json` collega ogni ambito ai talk (`events/<slug>.md`), agli articoli (`blog/<slug>.md`) e ai libri che lo dimostrano; titoli, date ed eventi sono letti dai file reali, quindi non vanno ricopiati. I testi di ogni ambito sono in `i18n/*.json` > `services.aiAreas`. Un riferimento sbagliato fa fallire la build.
- Articoli più vecchi: i file in `blog/` con `listed: false` non compaiono nell'elenco del blog né in home, ma si possono citare in `ai-areas.json` (per ambito AI) e `offer-articles.json` (per servizio). L'elenco completo dei tuoi articoli è nella pagina autrice di TheRedCode.it.
- Data «Ultimo aggiornamento» in Lavora con me: campo `updated` in `src/data/site.json` (formato `AAAA-MM-GG`); aggiornalo a mano quando cambi servizi o prezzi. Compare anche come `dateModified` nei dati strutturati.
- Elenco dei corsi: `services.offers[0].courses` in `i18n/*.json`; i nomi dei corsi sono pensati come frasi di ricerca («Corso Docker»…).
- **Controllo qualità**: una pagina che contiene ancora `[DA COMPLETARE]` (o `[TO COMPLETE]`, `[POR COMPLETAR]`) viene pubblicata con `noindex` e resta fuori dalla `sitemap.xml`, in tutte le lingue. La build stampa l'elenco. Appena completi i testi la pagina torna indicizzabile da sola.
- `lastmod` nella sitemap compare solo per Blog ed Eventi (date reali); per le altre pagine è omesso di proposito.

## SEO e GEO (ricerca generativa)

- Meta title (15–70 caratteri) e description (70–170) in `i18n/*.json` > `meta`: usa parole che i clienti cercano (consulenza AI, formazione DevOps, speaker).
- Dati strutturati JSON-LD (`scripts/lib/jsonld.mjs`): Person (ruoli, lingue, sede, sameAs), WebSite, BreadcrumbList su ogni pagina, FAQPage in Servizi,
  ProfilePage in Chi sono / Il mio percorso, Blog, Event per ogni talk (luogo solo se presente nel file).
- `llms.txt` e `robots.txt` si generano a ogni build (`scripts/lib/llms.mjs`); i crawler AI di ricerca sono ammessi in modo esplicito.
- «Scheda rapida» in Chi sono: fatti brevi ed estraibili. Tienila allineata con i numeri reali (talk, libri, ruoli).

## Variabili d'ambiente

Vedi `.env.example`: `GA_MEASUREMENT_ID` (vuoto = Analytics disattivato, nessun banner) e `SITE_URL` (canonical, sitemap, Open Graph).
In locale usa `.env`; su GitHub definiscile come **Variables** del repository (Settings > Secrets and variables > Actions > Variables).

## Deployment

1. Repository GitHub, branch `main`. Settings > Pages > Source: **GitHub Actions**.
2. Dominio personalizzato: `public/CNAME` contiene `serenasensini.it`; configura i DNS (record A/AAAA di GitHub Pages o CNAME per `www`).
3. Per un sito di progetto (`utente.github.io/repo`) imposta `SITE_URL=https://utente.github.io/repo`: i link usano il base path.
4. Il push su `main` esegue `.github/workflows/deploy.yml` (check + deploy). **Non fare deploy senza conferma esplicita di Serena.**
