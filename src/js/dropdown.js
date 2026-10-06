import { qa } from './utils';

const chevron = '<svg viewBox="0 0 12 8" aria-hidden="true"><path d="m1 1.5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

/**
 * Replaces a native <select> with a designed, keyboard-accessible dropdown.
 * The native element stays in the DOM (hidden) so forms, validation and 'change' listeners keep working.
 */
export function enhanceSelect(sel) {
  if (sel.dataset.dd) return;
  sel.dataset.dd = '1';

  const wrap = document.createElement('div');
  wrap.className = 'dd';
  sel.parentNode.insertBefore(wrap, sel);
  wrap.appendChild(sel);
  sel.classList.add('dd__native');
  sel.tabIndex = -1;
  sel.setAttribute('aria-hidden', 'true');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dd__btn';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  const label = sel.id && document.querySelector(`label[for="${sel.id}"]`);
  if (label) {
    label.id = label.id || `${sel.id}-label`;
    btn.setAttribute('aria-labelledby', label.id);
    label.addEventListener('click', (e) => {
      e.preventDefault();
      btn.focus();
    });
  }
  btn.innerHTML = `<span class="dd__label"></span>${chevron}`;

  const list = document.createElement('ul');
  list.className = 'dd__list';
  list.setAttribute('role', 'listbox');
  const opts = [...sel.options].filter((o) => o.value !== '');
  list.innerHTML = opts.map((o, i) => `<li class="dd__opt" role="option" id="${sel.id || 'dd'}-o${i}" data-value="${o.value || o.text}">${o.text}${check}</li>`).join('');
  wrap.append(btn, list);

  const items = qa('.dd__opt', list);
  let active = -1;
  const labelEl = btn.querySelector('.dd__label');

  const sync = () => {
    const cur = sel.selectedOptions[0];
    const empty = !cur || cur.value === '';
    labelEl.textContent = cur ? cur.text : '';
    btn.classList.toggle('is-placeholder', empty);
    items.forEach((li, i) => li.setAttribute('aria-selected', String(!empty && opts[i] === cur)));
  };
  sel._ddSync = sync;
  sync();

  const setActive = (i) => {
    active = (i + items.length) % items.length;
    items.forEach((li, k) => li.classList.toggle('is-active', k === active));
    items[active].scrollIntoView({ block: 'nearest' });
    btn.setAttribute('aria-activedescendant', items[active].id);
  };
  const open = () => {
    wrap.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    setActive(Math.max(0, opts.indexOf(sel.selectedOptions[0])));
  };
  const close = (focus) => {
    wrap.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    items.forEach((li) => li.classList.remove('is-active'));
    if (focus) btn.focus();
  };
  const choose = (i) => {
    sel.value = opts[i].value;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    sync();
    close(true);
  };

  btn.addEventListener('click', () => (wrap.classList.contains('is-open') ? close() : open()));
  items.forEach((li, i) => {
    li.addEventListener('pointermove', () => active !== i && setActive(i));
    li.addEventListener('click', () => choose(i));
  });
  btn.addEventListener('keydown', (e) => {
    const isOpen = wrap.classList.contains('is-open');
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      isOpen ? setActive(active + (e.key === 'ArrowDown' ? 1 : -1)) : open();
    } else if (['Enter', ' '].includes(e.key) && isOpen) {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      close(true);
    } else if (e.key === 'Tab' && isOpen) close();
  });
  document.addEventListener('click', (e) => !wrap.contains(e.target) && close());
  sel.addEventListener('change', sync);
}

export const initDropdowns = (scope = document) => qa('select', scope).forEach(enhanceSelect);
