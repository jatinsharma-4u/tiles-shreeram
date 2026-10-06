import { q } from './utils';

/** Normalised haystack for a product (name, collection, code, material, colour, finish…). */
export const haystack = (p) => `${p.name} ${p.collection} ${p.code} ${p.id} ${p.look} ${p.color} ${p.finish} ${p.category} ${p.size.replace('x', ' ')} ${p.application.join(' ')}`.toLowerCase();

/** Every whitespace-separated token must appear somewhere in the product text. */
export const matchesQuery = (p, query) => {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const h = p._h || (p._h = haystack(p));
  return tokens.every((t) => h.includes(t));
};

export function initSearch({ initial = '', onChange }) {
  const input = q('[data-search]');
  const clear = q('[data-search-clear]');
  const form = q('[data-search-form]');
  if (!input) return { set() {}, get: () => '' };

  let t;
  const sync = () => (clear.hidden = !input.value);
  input.value = initial;
  sync();

  input.addEventListener('input', () => {
    sync();
    clearTimeout(t);
    t = setTimeout(() => onChange(input.value.trim()), 120);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    onChange(input.value.trim());
    input.blur();
  });
  clear.addEventListener('click', () => {
    input.value = '';
    sync();
    onChange('');
    input.focus();
  });

  return {
    set(v) {
      input.value = v;
      sync();
    },
    get: () => input.value.trim(),
  };
}
