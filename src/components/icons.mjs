import { raw } from '../../scripts/lib/html.mjs';

// Icone a tratto semplice, in stile "disegnato a mano" (ispirate alla moodboard). Decorative: aria-hidden.
const PATHS = {
  ai: '<rect x="16" y="16" width="32" height="32" rx="5"/><path d="M24 10v6M32 10v6M40 10v6M24 48v6M32 48v6M40 48v6M10 24h6M10 32h6M10 40h6M48 24h6M48 32h6M48 40h6"/><path d="M24 40l4-14 4 14M25.5 35h5M38 26v14"/>',
  nlp: '<path d="M10 14h44a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H32L21 53V42H10a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z"/><path d="M16 24h32M16 32h20"/>',
  devops:
    '<circle cx="32" cy="32" r="14"/><path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M49 15l-6 6M21 43l-6 6"/><path d="M23 32c0-5 6-8 9 0s9 5 9 0-6-5-9 0-9 5-9 0z"/>',
  cloud:
    '<path d="M16 46h31a9 9 0 0 0 1-17.9A14 14 0 0 0 21 29a8.5 8.5 0 0 0-5 17z"/><path d="M26 38h12"/>',
  book: '<path d="M32 18C26 14 16 14 10 17v29c6-3 16-3 22 1 6-4 16-4 22-1V17c-6-3-16-3-22 1z"/><path d="M32 18v29"/>',
  plane: '<path d="M7 33L57 13 45 51 32 38 25 47 23 36z"/><path d="M23 36L57 13"/>',
};

export const icon = (name) =>
  raw(
    `<svg class="icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`,
  );
