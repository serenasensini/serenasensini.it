// Template HTML minimale con escaping automatico.
// Le interpolazioni sono escapate a meno che non siano passate da raw().

class Raw {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

export const raw = (value) => new Raw(String(value ?? ''));

export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const render = (value) => {
  if (value instanceof Raw) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  if (value === false || value === null || value === undefined) return '';
  return esc(value);
};

/** Tagged template: html`<p>${userText}</p>` restituisce un Raw già sicuro. */
export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, i) => {
    out += render(value) + strings[i + 1];
  });
  return new Raw(out);
}

/** Sostituisce {n} nei testi i18n. */
export const fmt = (text, vars = {}) =>
  String(text).replace(/\{(\w+)\}/g, (_, key) => (key in vars ? vars[key] : `{${key}}`));
