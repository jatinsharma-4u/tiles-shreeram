import gsap from 'gsap';
import { PRODUCTS, COLOR_HEX, fmtSize } from '../data/products';
import { q, qa, esc, hasMotion, cardHTML } from './utils';
import { initSearch, matchesQuery } from './productSearch';
import { lockScroll, unlockScroll, scrollToTarget } from './smoothScroll';

const FINISH_ORDER = ['Polished', 'Satin', 'Matt', 'Textured'];
const COLOR_ORDER = Object.keys(COLOR_HEX);
const area = (s) => s.split('x').reduce((a, b) => a * +b, 1);

const GROUPS = [
  { key: 'category', label: 'Category', type: 'opt' },
  { key: 'color', label: 'Colour', type: 'swatch', order: COLOR_ORDER },
  { key: 'finish', label: 'Finish', type: 'pill', order: FINISH_ORDER },
  { key: 'size', label: 'Size (mm)', type: 'pill', sort: (a, b) => area(a) - area(b), fmt: fmtSize },
  { key: 'look', label: 'Material / look', type: 'opt' },
  { key: 'application', label: 'Application', type: 'opt' },
];
const SORTS = [
  ['featured', 'Featured'],
  ['newest', 'Newest'],
  ['az', 'A to Z'],
  ['za', 'Z to A'],
];

const valuesOf = (p, key) => (Array.isArray(p[key]) ? p[key] : [p[key]]);

// build facet value lists from data
GROUPS.forEach((g) => {
  const set = [...new Set(PRODUCTS.flatMap((p) => valuesOf(p, g.key)))];
  g.values = g.order ? g.order.filter((v) => set.includes(v)) : g.sort ? set.sort(g.sort) : set.sort();
  g.fmt = g.fmt || ((v) => v);
});

export function initCatalogue() {
  const grid = q('[data-grid]');
  if (!grid) return;
  const panel = q('[data-filters]');
  const groupsEl = q('[data-filter-groups]');
  const chipsEl = q('[data-chips]');
  const countEls = qa('[data-count]');
  const applyCount = q('[data-apply-count]');
  const badge = q('[data-badge]');
  const empty = q('[data-empty]');
  const backdrop = q('[data-backdrop]');
  const sortSel = q('[data-sort]');
  const openBtn = q('[data-open-filters]');

  // After any filter/search/sort change, bring the user back to the first result (never leave them at the old, now-shorter scroll position)
  let sheetOpen = false;
  let pendingScroll = false;
  const toResults = () => {
    const main = q('.cat__main');
    const top = main.getBoundingClientRect().top + window.scrollY - (window.innerWidth >= 992 ? 80 : 74);
    if (window.scrollY > top + 8) scrollToTarget(Math.max(0, top));
  };
  const afterChange = () => (sheetOpen ? (pendingScroll = true) : toResults());

  const state = { q: '', sort: 'featured', f: Object.fromEntries(GROUPS.map((g) => [g.key, new Set()])) };

  // ---------- URL → state
  const params = new URLSearchParams(location.search);
  GROUPS.forEach((g) => {
    (params.get(g.key) || '')
      .split(',')
      .filter(Boolean)
      .forEach((raw) => {
        const hit = g.values.find((v) => v.toLowerCase() === raw.toLowerCase());
        if (hit) state.f[g.key].add(hit);
      });
  });
  state.q = (params.get('q') || '').trim();
  if (SORTS.some(([k]) => k === params.get('sort'))) state.sort = params.get('sort');

  const writeURL = () => {
    const p = new URLSearchParams();
    GROUPS.forEach((g) => state.f[g.key].size && p.set(g.key, [...state.f[g.key]].join(',')));
    if (state.q) p.set('q', state.q);
    if (state.sort !== 'featured') p.set('sort', state.sort);
    const s = p.toString();
    history.replaceState(null, '', s ? `?${s}` : location.pathname);
  };

  // ---------- build controls
  const checkSvg = '<svg aria-hidden="true"><use href="#i-check"/></svg>';
  const plusSvg = '<svg aria-hidden="true"><use href="#i-plus"/></svg>';

  const control = (g, v) => {
    const id = `f-${g.key}-${v.replace(/\W+/g, '-')}`;
    const input = `<input type="checkbox" id="${id}" data-key="${g.key}" value="${esc(v)}">`;
    if (g.type === 'swatch')
      return `<label class="swatch" for="${id}" title="${esc(v)}">${input}<span class="swatch__dot" style="--c:${COLOR_HEX[v]}"></span><span class="swatch__name">${esc(v)}</span></label>`;
    if (g.type === 'pill') return `<label class="pill" for="${id}">${input}<span>${esc(g.fmt(v))} <small data-n></small></span></label>`;
    return `<label class="opt" for="${id}">${input}<span class="opt__box">${checkSvg}</span><span class="opt__txt">${esc(g.fmt(v))}</span><span class="opt__n" data-n></span></label>`;
  };

  const sortGroup = `
    <details class="fgroup fgroup--sort" open>
      <summary class="fgroup__sum">Sort by ${plusSvg}</summary>
      <div class="fgroup__list">
        ${SORTS.map(
          ([k, l]) =>
            `<label class="opt"><input type="radio" name="sort-m" value="${k}" ${k === state.sort ? 'checked' : ''}><span class="opt__box" style="border-radius:50%">${checkSvg}</span><span class="opt__txt">${l}</span></label>`
        ).join('')}
      </div>
    </details>`;

  groupsEl.innerHTML =
    sortGroup +
    GROUPS.map(
      (g, i) => `
    <details class="fgroup" ${['color', 'finish', 'look'].includes(g.key) || state.f[g.key].size ? 'open' : ''}>
      <summary class="fgroup__sum">${g.label} ${plusSvg}</summary>
      <div class="${g.type === 'swatch' ? 'fgroup__swatches' : g.type === 'pill' ? 'fgroup__pills' : 'fgroup__list'}">${g.values.map((v) => control(g, v)).join('')}</div>
    </details>`
    ).join('');

  // reflect initial state
  qa('input[data-key]', groupsEl).forEach((inp) => (inp.checked = state.f[inp.dataset.key].has(inp.value)));
  sortSel.value = state.sort;
  sortSel._ddSync?.();
  const search = initSearch({ initial: state.q, onChange: (v) => ((state.q = v), update(), afterChange()) });

  // ---------- filtering
  const matches = (p, skipKey) =>
    GROUPS.every((g) => g.key === skipKey || !state.f[g.key].size || valuesOf(p, g.key).some((v) => state.f[g.key].has(v))) && matchesQuery(p, state.q);

  const sorters = {
    featured: (a, b) => b.featured - a.featured || a.added - b.added,
    newest: (a, b) => b.added - a.added,
    az: (a, b) => a.name.localeCompare(b.name),
    za: (a, b) => b.name.localeCompare(a.name),
  };

  let lastKey = '';
  const render = (list) => {
    const key = list.map((p) => p.id).join();
    if (key === lastKey) return;
    lastKey = key;
    grid.innerHTML = list.map(cardHTML).join('');
    if (hasMotion()) {
      gsap.fromTo(qa('.pcard', grid), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: { each: 0.035, amount: 0.5 }, ease: 'power3.out', overwrite: true, clearProps: 'transform' });
    }
  };

  const updateCounts = () => {
    GROUPS.forEach((g) => {
      const pool = PRODUCTS.filter((p) => matches(p, g.key));
      qa(`input[data-key="${g.key}"]`, groupsEl).forEach((inp) => {
        const n = pool.filter((p) => valuesOf(p, g.key).includes(inp.value)).length;
        const label = inp.closest('label');
        const slot = label.querySelector('[data-n]');
        if (slot) slot.textContent = n;
        label.classList.toggle('is-zero', n === 0 && !inp.checked);
      });
    });
  };

  const renderChips = () => {
    const chips = GROUPS.flatMap((g) => [...state.f[g.key]].map((v) => ({ g, v })));
    chipsEl.innerHTML = chips.length
      ? chips.map(({ g, v }) => `<button type="button" class="chip" data-chip="${g.key}" data-v="${esc(v)}" aria-label="Remove filter ${esc(g.fmt(v))}">${esc(g.fmt(v))}<svg aria-hidden="true"><use href="#i-close"/></svg></button>`).join('') +
        `<button type="button" class="chip chip--clear" data-clear-all>Clear all</button>`
      : '';
    badge.hidden = !chips.length;
    qa('.filters__clear').forEach((b) => (b.hidden = !chips.length && !state.q));
    badge.textContent = chips.length;
  };

  function update() {
    const list = PRODUCTS.filter((p) => matches(p)).sort(sorters[state.sort]);
    render(list);
    countEls.forEach((el) => {
      if (el.textContent !== String(list.length)) {
        el.textContent = list.length;
        el.classList.remove('bump');
        void el.offsetWidth; // restart the micro-animation
        el.classList.add('bump');
      }
    });
    applyCount.textContent = list.length;
    empty.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    updateCounts();
    renderChips();
    writeURL();
  }

  // ---------- events
  groupsEl.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'sort-m') {
      state.sort = t.value;
      sortSel.value = t.value;
      sortSel._ddSync?.();
    } else if (t.dataset.key) {
      t.checked ? state.f[t.dataset.key].add(t.value) : state.f[t.dataset.key].delete(t.value);
    }
    update();
    afterChange();
  });
  sortSel.addEventListener('change', () => {
    state.sort = sortSel.value;
    qa('input[name="sort-m"]', groupsEl).forEach((r) => (r.checked = r.value === state.sort));
    update();
    afterChange();
  });

  const clearAll = () => {
    GROUPS.forEach((g) => state.f[g.key].clear());
    qa('input[data-key]', groupsEl).forEach((i) => (i.checked = false));
    state.q = '';
    search.set('');
    update();
    afterChange();
  };
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-chip]');
    if (chip) {
      state.f[chip.dataset.chip].delete(chip.dataset.v);
      const inp = qa(`input[data-key="${chip.dataset.chip}"]`, groupsEl).find((i) => i.value === chip.dataset.v);
      if (inp) inp.checked = false;
      update();
      afterChange();
      return;
    }
    if (e.target.closest('[data-clear-all]')) clearAll();
  });

  // ---------- mobile bottom sheet
  const setSheet = (open) => {
    if (open === sheetOpen) return;
    sheetOpen = open;
    panel.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    open ? lockScroll() : unlockScroll();
    if (!open && pendingScroll) {
      pendingScroll = false;
      requestAnimationFrame(toResults);
    }
    if (open) panel.querySelector('summary, input')?.focus({ preventScroll: true });
    else openBtn.focus({ preventScroll: true });
  };
  openBtn.addEventListener('click', () => setSheet(true));
  qa('[data-close-filters], [data-apply]').forEach((b) => b.addEventListener('click', () => setSheet(false)));
  backdrop.addEventListener('click', () => setSheet(false));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setSheet(false));
  window.matchMedia('(min-width: 992px)').addEventListener('change', (e) => e.matches && setSheet(false));

  update();
}
