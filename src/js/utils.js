import { fmtSize } from '../data/products';

export const q = (sel, root = document) => root.querySelector(sel);
export const qa = (sel, root = document) => [...root.querySelectorAll(sel)];
export const hasMotion = () => document.documentElement.classList.contains('motion');
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const arrowIcon = '<svg aria-hidden="true"><use href="#i-arrow"/></svg>';

/** Responsive product-tile <img> (card sizes). */
export const tileImg = (p, { cls = '', sizes = '(min-width: 992px) 22vw, 46vw', lazy = true, alt } = {}) =>
  `<img class="${cls}" src="${p.imageSm}" srcset="${p.imageSm} 640w, ${p.image} 2000w" sizes="${sizes}" width="640" height="640" alt="${esc(
    alt ?? `${p.name}, ${p.look.toLowerCase()}-look ${p.finish.toLowerCase()} tile`
  )}" ${lazy ? 'loading="lazy"' : ''} decoding="async">`;

/** Premium product card (used in catalogue, related and featured grids). */
export const cardHTML = (p) => `
<a class="pcard" href="product.html?id=${p.id}" data-id="${p.id}">
  <div class="pcard__media">
    ${tileImg(p, { cls: 'pcard__img' })}
    <span class="pcard__layout" aria-hidden="true">${`<i style="background-image:url(${p.imageSm})"></i>`.repeat(4)}</span>
  </div>
  <div class="pcard__body">
    <span class="pcard__coll">${esc(p.collection)} · ${esc(p.look)}</span>
    <h3 class="pcard__name">${esc(p.name)}</h3>
    <p class="pcard__meta">${esc(p.finish)} • ${fmtSize(p.size)}</p>
    <span class="pcard__cta">View product <svg aria-hidden="true"><use href="#i-arrow"/></svg></span>
  </div>
</a>`;

/**
 * Splits an element's text into masked words ( .w > span ), preserving <br> and inline elements.
 * Returns the inner word spans.
 */
export function splitWords(el) {
  if (el.dataset.split) return qa('.w > span', el);
  el.dataset.split = '1';
  const label = el.textContent.replace(/\s+/g, ' ').trim();
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
          } else {
            const w = document.createElement('span');
            w.className = 'w';
            w.setAttribute('aria-hidden', 'true');
            w.innerHTML = `<span>${esc(part)}</span>`;
            frag.appendChild(w);
          }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') {
        walk(n);
      }
    });
  };
  walk(el);
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = label;
  el.prepend(sr);
  return qa('.w > span', el);
}

/** Same as splitWords but unmasked (opacity-scrubbed statement). */
export function splitScrub(el) {
  if (el.dataset.split) return qa('.sw', el);
  el.dataset.split = '1';
  const label = el.textContent.replace(/\s+/g, ' ').trim();
  const words = label.split(' ');
  el.innerHTML = `<span class="sr-only">${esc(label)}</span>` + words.map((w) => `<span class="sw" aria-hidden="true">${esc(w)}</span>`).join(' ');
  return qa('.sw', el);
}
