import { html, raw, fmt } from '../../scripts/lib/html.mjs';
import { markTodo } from '../../scripts/lib/markdown.mjs';

/** Evidenzia i segnaposto [DA COMPLETARE] in un testo semplice (già escapato). */
export const todoText = (text) => raw(markTodo(html`${text}`.toString()));

export const isTodo = (...values) =>
  values.some((v) => /\[(DA COMPLETARE|TO COMPLETE|POR COMPLETAR)\]/.test(String(v ?? '')));

export const button = ({ href, label, variant = 'primary' }) =>
  html`<a class="btn${variant === 'secondary' ? ' btn--secondary' : ''}" href="${href}"
    >${label}</a
  >`;

export const badge = (text, accent = false) =>
  html`<span class="badge${accent ? ' badge--accent' : ''}">${text}</span>`;

export const badgeList = (items) =>
  items?.length
    ? html`<ul class="badge-list">
        ${items.map((i) => html`<li>${badge(i)}</li>`)}
      </ul>`
    : '';

export const externalLink = (href, label, cls = '', rel = 'noopener') =>
  html`<a${cls ? raw(` class="${cls}"`) : ''} href="${href}" rel="${rel}">${label}</a>`;

export const emptyState = (message) => html`<p class="empty">${message}</p>`;

export const quote = ({ text, author, role }) =>
  html`<figure class="quote">
    <blockquote><p>${text}</p></blockquote>
    <figcaption>${author}${role ? html`, ${role}` : ''}</figcaption>
  </figure>`;

/** Blocco di codice con etichetta accessibile e tabindex per lo scroll da tastiera. */
export const codeBlock = ({ code, lang = '', label }) =>
  html`<pre tabindex="0" role="region" aria-label="${label}"><code${lang ? raw(` class="language-${lang}"`) : ''}>${code}</code></pre>`;

/**
 * Immagine responsive con aspect ratio controllato (ratio es. "16 / 9"). Alt vuoto = decorativa.
 * Con `srcset` il browser sceglie la larghezza giusta; width/height evitano salti di layout.
 */
export const media = ({
  src,
  alt = '',
  ratio = '4 / 5',
  width,
  height,
  srcset,
  sizes,
  eager = false,
  priority = false,
}) =>
  html`<figure class="media" style="--ratio: ${ratio}">
    <img
      src="${src}"
      alt="${alt}"
      ${srcset ? raw(`srcset="${srcset}" sizes="${sizes}"`) : ''}
      ${width ? raw(`width="${width}" height="${height}"`) : ''}
      loading="${eager ? 'eager' : 'lazy'}"
      ${priority ? raw('fetchpriority="high"') : ''}
      decoding="async"
    />
  </figure>`;

/** Foto configurata in site.json > photos.<key> (file <base>-<larghezza>.webp). Vuoto se non configurata. */
export function photo(ctx, key, { alt, sizes, ratio = '4 / 5', eager = false, priority = false }) {
  const p = ctx.site.photos?.[key];
  if (!p) return '';
  const file = (w) => ctx.asset(`${p.base}-${w}.webp`);
  const widths = [...p.widths].sort((x, y) => x - y);
  return media({
    src: file(widths.at(-1)),
    srcset: widths.map((w) => `${file(w)} ${w}w`).join(', '),
    sizes,
    alt,
    ratio,
    width: p.width,
    height: p.height,
    eager,
    priority,
  });
}

export const breadcrumb = (items, label) =>
  html`<nav class="breadcrumb" aria-label="${label}">
    <ol>
      ${items.map((item, i) =>
        i === items.length - 1
          ? html`<li><span aria-current="page">${item.label}</span></li>`
          : html`<li><a href="${item.href}">${item.label}</a></li>`,
      )}
    </ol>
  </nav>`;

/** Paginazione: hrefFor(n) restituisce l'URL della pagina n. */
export function pagination({ page, pages, hrefFor, t }) {
  if (pages <= 1) return '';
  const item = (n, label, aria) =>
    n === page
      ? html`<li><span aria-current="page" aria-label="${t.ui.page} ${n}">${label}</span></li>`
      : html`<li><a href="${hrefFor(n)}" aria-label="${aria}">${label}</a></li>`;
  return html`<nav class="pagination" aria-label="${t.ui.pagination}">
    <ul>
      ${page > 1 ? html`<li><a href="${hrefFor(page - 1)}" rel="prev">${t.ui.prev}</a></li>` : html`<li><span aria-disabled="true">${t.ui.prev}</span></li>`}
      ${Array.from({ length: pages }, (_, i) => item(i + 1, i + 1, `${t.ui.page} ${i + 1}`))}
      ${page < pages ? html`<li><a href="${hrefFor(page + 1)}" rel="next">${t.ui.next}</a></li>` : html`<li><span aria-disabled="true">${t.ui.next}</span></li>`}
    </ul>
  </nav>`;
}

/** Messaggio di stato (toast): role=status per successo, role=alert per errore. */
export const toast = ({ type = 'success', message }) =>
  html`<div class="toast toast--${type}" role="${type === 'error' ? 'alert' : 'status'}">
    ${message}
  </div>`;

/** Campo di form con etichetta esplicita e messaggio di errore associato (aria-describedby). */
export const field = ({ id, label, type = 'text', required = false, error = '', hint = '' }) => {
  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');
  const control =
    type === 'textarea'
      ? html`<textarea
          id="${id}"
          name="${id}"
          rows="5"
          ${required ? raw(' required') : ''}${error ? raw(' aria-invalid="true"') : ''}${described ? raw(` aria-describedby="${described}"`) : ''}
        ></textarea>`
      : html`<input
          id="${id}"
          name="${id}"
          type="${type}"
          ${required ? raw(' required') : ''}${error ? raw(' aria-invalid="true"') : ''}${described ? raw(` aria-describedby="${described}"`) : ''}
        />`;
  return html`<div class="field">
    <label for="${id}">${label}</label>
    ${hint ? html`<span id="${id}-hint">${hint}</span>` : ''} ${control}
    ${error ? html`<span class="field__error" id="${id}-error">${error}</span>` : ''}
  </div>`;
};

export { fmt };
