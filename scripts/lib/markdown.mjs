import { marked } from 'marked';
import { raw } from './html.mjs';

marked.setOptions({ gfm: true, breaks: false });

// Evidenzia i segnaposto [DA COMPLETARE] / [TO COMPLETE] / [POR COMPLETAR] nel testo renderizzato.
const TODO = /\[(DA COMPLETARE|TO COMPLETE|POR COMPLETAR)([^\]]*)\]/g;

export const markTodo = (htmlText) => htmlText.replace(TODO, '<mark class="todo">[$1$2]</mark>');

/** Vero se il testo contiene ancora un segnaposto: la pagina non va indicizzata finché non è completa. */
export const hasPlaceholder = (text) => new RegExp(TODO.source).test(String(text));

export function renderMarkdown(source) {
  return raw(markTodo(marked.parse(source)));
}

export function renderInline(source) {
  return raw(markTodo(marked.parseInline(source)));
}
