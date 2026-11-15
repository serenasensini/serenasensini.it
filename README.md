# serenasensini.it

Sito personale di Serena Sensini: HTML + SCSS + contenuti in Markdown, trilingue (IT/EN/ES), pubblicato su GitHub Pages.
Per le istruzioni operative (aggiungere eventi e articoli, cambiare colori, deploy) vedi anche [`CLAUDE.md`](CLAUDE.md).

## Avvio rapido

```bash
npm install
npm run dev      # http://localhost:4321, ricostruisce a ogni modifica
npm run check    # build + lint + test + accessibilità + SEO/GEO
```

Serve Node 20 o superiore. `dist/` è l'output da pubblicare.

## Struttura

```text
src/
├── components/   header, footer, card, bottoni, badge, form, citazione, codice, immagine, breadcrumb, paginazione, stato vuoto, toast
├── layouts/      base.mjs (head SEO, skip link, landmark)
├── pages/        una funzione per pagina (home, about, story, services, projects, events, blog, contact, privacy, notfound)
├── content/      blog/*.md · events/*.md · pages/<lingua>/{about,story,privacy}.md
├── data/         site.json · testimonials.json · i18n/{it,en,es}.json
├── styles/       _tokens.scss (design system) · _base · _layout · _components
└── scripts/      main.js (menu, filtri eventi, consenso + GA)
scripts/          build, dev server, controlli a11y, pipeline `check`, elenco segnaposto
tests/            test con il runner nativo di Node
public/           font self-hosted, favicon, CNAME, immagini
```

## Controllo qualità prima della pubblicazione

Le pagine con segnaposto (`[DA COMPLETARE]`) sono automaticamente `noindex` e fuori dalla sitemap. Oggi nessuna pagina ne contiene: sono tutte indicizzabili. Lo stato si legge a ogni `npm run build`.

## SEO e GEO

- Titolo principale con parole chiave (home: nome + ruolo; Lavora con me: «Formazione, consulenza AI e speaker a Roma e online»), frase definitoria in home, lessico di ricerca («formatrice», «relatrice», «consulente», «docente ITS») nei testi dei servizi, elenco dei corsi.
- Libri con ISBN-13 e link agli editori nei dati strutturati; data di aggiornamento dichiarata; font calligrafica ridotta da 75 a 48 kB.

- Titoli e descrizioni orientati alle ricerche dei clienti, un solo `h1`, URL puliti, canonical e hreflang IT/EN/ES.
- JSON-LD: Person (ruoli, sede, lingue, sameAs), BreadcrumbList, FAQPage, ProfilePage, Blog, Event; validato a ogni build (`npm run check:seo`).
- Per i motori generativi: `llms.txt`, scheda rapida con fatti sintetici in Chi sono, FAQ in forma domanda/risposta, crawler AI ammessi in `robots.txt`
  (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…). Se non vuoi che i contenuti servano ad addestrare modelli, togli quelle righe in `scripts/lib/llms.mjs`.
- Dopo il deploy: Google Search Console (aggiungi la proprietà, invia `sitemap.xml`), Bing Webmaster Tools, profilo LinkedIn con link al sito,
  link reciproci da TheRedCode.it ed Emblema. Citazioni e link da siti terzi pesano più di qualsiasi meta tag.

## Direzione visiva

Dalla moodboard: sfondo grigio caldo, due colori principali (rosso `#cd2222` e malva `#7d5050`), titoletti calligrafici,
icone a tratto "disegnato a mano" per i temi (AI, NLP, DevOps, cloud) e i hobby (lettura, viaggi), foto di Serena sul palco e in formazione.
Tutto si regola da `src/styles/_tokens.scss`.

- **Colori e contrasti** (verificati a ogni build):

  | Uso | Colore | Contrasto |
  | --- | --- | --- |
  | Bottoni primari, numeri grandi, decorazioni | `#cd2222` (esatto) | 5.1:1 col testo chiaro, 5.1:1 su sfondo |
  | Testo piccolo e link in rosso | `#b81e1e` (variante più profonda) | 6.1:1 su sfondo, 5.1:1 su fondo rosato |
  | Testo secondario, bordi dei controlli | `#7d5050` (esatto) | 6.3:1 su sfondo, 5.3:1 su fondo rosato |
  | Link su sfondo scuro | `#ffa8a0` | 8.9:1 su `#2a1b1b` |

  Perché la variante: `#cd2222` come testo piccolo passa su carta (5.1:1) ma non sul fondo rosato (4.3:1, sotto 4.5), e su fondo scuro vale solo 3.0:1.
  Alternativa più prudente: usare `#b81e1e` anche per i bottoni (6.1:1); basta cambiare `--color-accent`.
  Tema scuro (`_dark.scss`): fondo `#1c1515`, testo `#f3eded`, rosso testo `#ff9a92`; bottoni sempre nel rosso `#cd2222` (4.7:1). Contrasti verificati per entrambi i temi.
  Neutri: carta `#f2f2ee`, superfici `#e4e4df` (il grigio della moodboard), inchiostro `#261a1a`, sezioni scure `#2a1b1b`; successo `#1e6b3a`, errore `#a4161a`.
- **Tipografia**: Fraunces (titoli) + Inter (testo) + Caveat (calligrafico, solo per titoletti e annotazioni grandi, mai per testo corrente), tutti variable e self-hosted; scala fluida con `clamp()`.
- **Stile**: raggi 6/12/20 px, ombre leggere, niente gradienti, 3D o animazioni pesanti; icone solo come decorazione.
- **Breakpoint**: 640, 768, 1024, 1280 px, mobile-first.

## Contenuti: da dove arrivano

| Contenuto | Fonte |
| --- | --- |
| 50+ talk (29 con evento e data, 3 nel repertorio) | profilo pubblico [Emblema](https://emblema.live/speaker/ssensini); descrizioni sintetizzate da me |
| Bio, "10+ anni di speaking", "5 libri", lingue, competenze | stesso profilo Emblema |
| Ambassador Codemotion, tutor LUG, certificazioni, laurea a Roma Tre | parte pubblica del profilo LinkedIn |
| 9 articoli | homepage di TheRedCode.it (descrizioni riscritte da me) |

Il sito non inventa clienti, premi, numeri o testimonianze.

## Da rivedere (`npm run todo`)

- **Ruoli e date**: dal tuo LinkedIn: CTO @ Welyk (da mag 2026), Tech Expert @ Welyk (da mar 2024), ex Innovation & Emerging Technologies Leader @ Dedalus (gen 2025 – dic 2026), Enterprise Architect @ Dedalus (nov 2020 – gen 2025), Fondatrice di TheRedCode.it (da mar 2021). Il titolo «Tech Mentor» in home viene da Emblema: su LinkedIn sei «Tech Expert».
- **Il mio percorso** (`story.md`): ruoli, studi e community compilati con i dati che mi hai fornito.
- **Proposta di valore**, servizi, processo in 4 passi e FAQ: bozze scritte da me a partire dai tuoi talk e dal brief. Verifica tono e promesse.
- **Contenuti completi**: nessun segnaposto nelle pagine; tutte le pagine sono indicizzabili. Resta aperto un dettaglio: i ruoli precedenti a Dedalus (data scientist, AI expert, sysadmin, DevOps, full-stack) sono citati senza aziende né date. La privacy è completa (titolare: Serena Sensini): verifica con un professionista e imposta in Google Analytics la conservazione a 14 mesi.
- **Email e link calendario** (`site.json`): oggi la CTA principale porta a LinkedIn.
- **Foto**: ritratto (home), talk (Chi sono) e palco (Eventi) sono in `public/images/` in WebP responsive, con metadati rimossi; `og.jpg` è l'anteprima social ricavata dalla foto sul palco. Il testo alternativo è in `i18n/*.json` (`ui.photo*Alt`): verificalo.
- **Hobby** (lettura, viaggi): ricavati dalla moodboard; conferma il testo «Oltre il lavoro».
- **Tipologia degli eventi**: dove Emblema non lo specifica ho messo `talk`; solo il panel Pycon 2022 è `panel`. Luoghi e formato (online/presenza) mancano.
- **Privacy policy**: completa (titolare, conservazione 14 mesi, contatto per i diritti); da far validare da un professionista.
- **Traduzioni EN/ES**: scritte da me, da far rileggere. Le descrizioni dei talk restano nella lingua originale.
- Tre talk del repertorio (Semantic Search, DevOps to DevOoops, Cost-Aware MLOps) su Emblema non hanno evento associato: se sono già programmati, spostali in eventi con data.

## Decisioni e alternative

| Decisione | Perché | Alternativa |
| --- | --- | --- |
| Generatore statico minimo in Node (nessun framework) | Stack "HTML + SCSS + Markdown" richiesto; zero JS di framework, build di ~1 s, facile da capire | Astro o Eleventy se il sito crescerà (più pagine dinamiche, immagini ottimizzate) |
| Template come funzioni JS con escaping automatico | Niente motore di template da installare; componenti riusabili e testabili | Nunjucks/Liquid |
| Blog = anteprime con link a TheRedCode.it | Il blog esiste già e ha altri autori; evita contenuti duplicati e SEO cannibalizzata | Importare gli articoli in Markdown e avere un blog interno (con RSS) |
| Italiano alla radice, `/en/` e `/es/` con hreflang | URL puliti per il pubblico principale, SEO multilingua corretta | Prefisso anche per l'italiano (`/it/`) |
| Eventi in file Markdown con frontmatter | Aggiunta semplice anche per chi non programma, un file per evento | CSV/JSON unico, oppure sync automatico da Emblema se esporrà un'API pubblica |
| Futuro/passato calcolato alla build + rebuild settimanale | Resta statico; il cron aggiorna le liste | Calcolo nel browser (meno SEO-friendly) |
| Google Analytics solo dopo consenso, banner non modale | Conformità GDPR/ePrivacy; nessun cookie senza scelta | Plausible/Umami (senza banner, ma servizio diverso dal richiesto) |
| Nessun form di contatto | Richiesto; CTA verso LinkedIn | Formspree o Netlify Forms (i componenti `field` e `toast` sono già pronti) |
| Font self-hosted (variable, solo subset latin) | Prestazioni e privacy (nessuna richiesta a Google Fonts) | Font di sistema |
| Controlli a11y propri + Lighthouse manuale | Nessuna dipendenza pesante (niente Chrome headless in CI) | `pa11y-ci` o `@axe-core/cli` |
| Sito in TypeScript: **no** | Stack HTML/SCSS richiesto; la validazione dei dati è fatta a runtime (`validateEvent`, test sulle chiavi i18n) | JSDoc con `// @ts-check` |

## Checklist finale

Segna ✅ = verificato automaticamente, 🔲 = da fare a mano prima del lancio.

**Accessibilità (WCAG 2.2 AA)**
- ✅ HTML semantico, un `h1` per pagina, nessun salto di livello nei titoli, landmark `header`/`nav`/`main`/`footer`
- ✅ Skip link "Vai al contenuto principale" come primo elemento focalizzabile
- ✅ Contrasto dei token di colore (coppie verificate per entrambi i temi) ≥ soglia AA
- ✅ Nessun link generico; link interni risolti; id univoci; `aria-*` con riferimenti validi
- ✅ Focus visibile, target di tocco ≥ 44 px, `prefers-reduced-motion` rispettato, nessuna animazione lampeggiante
- ✅ Menu mobile e filtri usano button con `aria-expanded`/`aria-pressed`, regione `role="status"` per il conteggio
- 🔲 Lighthouse Accessibility ≥ 95 su home, eventi, contatti
- 🔲 Navigazione solo tastiera (Tab, Shift+Tab, Esc nel menu) e prova rapida con screen reader (NVDA/VoiceOver)

**SEO**
- ✅ `title` e `meta description` per ogni pagina e lingua, canonical, hreflang + x-default
- ✅ Open Graph e Twitter Card, `sitemap.xml` generata (con alternate), `robots.txt`, favicon SVG
- ✅ JSON-LD: Person, WebSite, Organization (TheRedCode.it), Blog/BlogPosting, ProfessionalService, Event (solo se c'è il luogo)
- ✅ Immagine Open Graph 1200×630 (`images/og.jpg`)
- 🔲 Registrare il sito e la sitemap in Google Search Console

**Prestazioni**
- ✅ CSS ~20 kB, JS ~3 kB non minificato, nessuna dipendenza runtime, font preload `swap`
- ✅ Nessuna immagine bloccante (lazy loading già nel componente `media`)
- 🔲 Lighthouse Performance ≥ 95 dopo il deploy; se aggiungi foto, comprimile (WebP/AVIF) con `width`/`height`

**Responsive**
- ✅ Mobile-first, tipografia fluida, griglie 1/2/3 colonne, nessuno scroll orizzontale a 375 px
- 🔲 Prova su un telefono reale in verticale e orizzontale

**Privacy**
- ✅ Analytics non parte senza consenso; preferenza modificabile dal footer
- 🔲 Inserire `GA_MEASUREMENT_ID` e far validare la privacy policy prima di attivarlo

## Repository pubblico: sicurezza

Il progetto è sicuro da rendere pubblico: nessun segreto nel codice, `.env` e `.claude/` sono in `.gitignore`,
le immagini non hanno metadati EXIF e non ci sono dipendenze di produzione. Il workflow parte solo su push a `main`,
sulla pianificazione settimanale e a mano (mai su `pull_request_target`), con permessi minimi.
`GA_MEASUREMENT_ID` e `SITE_URL` si impostano come **Variables** su GitHub, non in file versionati.
Dependabot (`.github/dependabot.yml`) propone ogni settimana gli aggiornamenti delle dipendenze.
Per segnalare problemi vedi [`SECURITY.md`](SECURITY.md).

Impostazioni da attivare su GitHub dopo aver creato il repository (sostituisci `OWNER/REPO`, ad esempio `serenasensini/serenasensini.it`).
Account: attiva l'autenticazione a due fattori da Settings > Password and authentication (non è automatizzabile).

```bash
# Alert di sicurezza e aggiornamenti automatici di Dependabot
gh api -X PUT repos/OWNER/REPO/vulnerability-alerts
gh api -X PUT repos/OWNER/REPO/automated-security-fixes

# Secret scanning e push protection
gh api -X PATCH repos/OWNER/REPO \
  -f 'security_and_analysis[secret_scanning][status]=enabled' \
  -f 'security_and_analysis[secret_scanning_push_protection][status]=enabled'

# Branch main: niente force-push né cancellazione (puoi comunque fare push diretti)
gh api -X PUT repos/OWNER/REPO/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

# Workflow di contributor esterni solo dopo la tua approvazione
gh api -X PUT repos/OWNER/REPO/actions/permissions/fork-pr-contributor-approval \
  -f approval_policy=all_external_contributors
```

## Licenza

- **Codice** (script, componenti, stili, test, configurazione): [MIT](LICENSE).
- **Contenuti** (testi, traduzioni, foto, nome e identità visiva): tutti i diritti riservati, vedi [`CONTENT-LICENSE.md`](CONTENT-LICENSE.md).
  Se riusi il codice per un tuo sito, sostituisci tutti i contenuti.
- **Font** (Fraunces, Inter, Caveat): SIL Open Font License 1.1.
