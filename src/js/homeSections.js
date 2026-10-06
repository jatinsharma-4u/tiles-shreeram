import gsap from 'gsap';
import { PRODUCTS, APPLICATION_SCENES, byKey, fmtSize, unique } from '../data/products';
import { q, qa, esc, hasMotion, tileImg, arrowIcon } from './utils';

/* ------------------------------------------------------------------ stats + collection counts */
export function initStats() {
  const stats = {
    designs: PRODUCTS.length,
    looks: unique('look').length,
    sizes: new Set(PRODUCTS.map((p) => p.size)).size,
    finishes: new Set(PRODUCTS.map((p) => p.finish)).size,
  };
  qa('[data-stat]').forEach((el) => {
    const n = stats[el.dataset.stat];
    if (n == null) return;
    el.textContent = n;
  });
  qa('[data-count-look]').forEach((el) => {
    el.textContent = PRODUCTS.filter((p) => p.look === el.dataset.countLook).length;
  });
  const y = q('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
}

/* ------------------------------------------------------------------ featured products */
export function initFeatured() {
  const root = q('[data-featured]');
  if (!root) return;
  const list = PRODUCTS.filter((p) => p.featured);
  const [lead, ...rest] = list;

  const meta = (p) => `${esc(p.finish)} • ${fmtSize(p.size)} mm`;
  const media = (p, sizes) => `<div class="fcard__media">${tileImg(p, { sizes })}</div>`;

  root.innerHTML = `
    <a class="fcard fcard--lg" href="product.html?id=${lead.id}">
      ${media(lead, '(min-width: 992px) 56vw, 100vw')}
      <div class="fcard__body">
        <span class="fcard__eyebrow">${esc(lead.collection)} · ${esc(lead.look)}</span>
        <h3>${esc(lead.name)}</h3>
        <p class="fcard__meta">${meta(lead)}</p>
        <p class="fcard__desc">${esc(lead.description)}</p>
        <span class="link-arrow fcard__cta"><span>View product</span>${arrowIcon}</span>
      </div>
    </a>
    <div class="feat__side">
      ${rest
        .map(
          (p) => `
        <a class="fcard fcard--row" href="product.html?id=${p.id}">
          ${media(p, '(min-width: 768px) 170px, 112px')}
          <div class="fcard__body">
            <span class="fcard__eyebrow">${esc(p.collection)} · ${esc(p.look)}</span>
            <h3>${esc(p.name)}</h3>
            <p class="fcard__meta">${meta(p)}</p>
            <p class="fcard__desc">${esc(p.tagline)}</p>
            <span class="link-arrow fcard__cta"><span>View product</span>${arrowIcon}</span>
          </div>
        </a>`
        )
        .join('')}
    </div>`;
}

/* ------------------------------------------------------------------ applications (room tabs) */
const APP_PICKS = {
  'Living Room': { key: 'S01', scene: 'scene-living-cream' },
  Bedroom: { key: 'M06', scene: 'scene-bedroom' },
  Kitchen: { key: 'M02', scene: 'scene-kitchen' },
  Bathroom: { key: 'W02', scene: 'scene-bathroom' },
  Commercial: { key: 'C02', scene: 'scene-office' },
  Outdoor: { key: 'S02', scene: 'scene-outdoor' },
};

export function initApplications() {
  const root = q('[data-apps]');
  if (!root) return;
  const tabsEl = q('[data-apps-tabs]', root);
  const stage = q('[data-apps-stage]', root);
  const names = Object.keys(APPLICATION_SCENES);

  tabsEl.innerHTML = names
    .map(
      (n, i) =>
        `<button class="apps__tab" role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" type="button">${n}<span>${String(i + 1).padStart(2, '0')}</span></button>`
    )
    .join('');

  stage.innerHTML = names
    .map((n, i) => {
      const { key, scene } = APP_PICKS[n];
      const p = byKey(key);
      return `
      <article class="app${i === 0 ? ' is-active' : ''}" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}" ${i === 0 ? '' : 'aria-hidden="true"'}>
        <div class="app__media"><img src="images/${scene}-sm.webp" srcset="images/${scene}-sm.webp 900w, images/${scene}.webp 1920w, images/${scene}-lg.webp 2880w" sizes="(min-width: 992px) 65vw, 100vw" width="1920" height="1280" alt="${esc(n)} interior featuring ${esc(p.name)} tiles" loading="lazy" decoding="async"></div>
        <div class="app__card">
          <img class="app__chip" src="${p.imageSm}" width="104" height="104" alt="" loading="lazy">
          <div class="app__txt"><span>${esc(p.collection)} · ${esc(p.look)}</span><strong>${esc(p.name)}</strong><small>${esc(p.finish)} • ${fmtSize(p.size)} mm</small></div>
          <a class="link-arrow app__go" href="product.html?id=${p.id}"><span>View product</span>${arrowIcon}</a>
        </div>
      </article>`;
    })
    .join('');

  const tabs = qa('.apps__tab', tabsEl);
  const panels = qa('.app', stage);
  const select = (i, focus) => {
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    panels.forEach((p, k) => {
      p.classList.toggle('is-active', k === i);
      p.toggleAttribute('aria-hidden', k !== i);
    });
    if (focus) tabs[i].focus();
    if (hasMotion()) {
      gsap.fromTo(q('.app__media', panels[i]), { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1, ease: 'power3.inOut', overwrite: true });
      gsap.fromTo(q('.app__card', panels[i]), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.35, ease: 'power3.out', overwrite: true });
    }
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
  tabsEl.addEventListener('keydown', (e) => {
    const cur = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const next = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!next) return;
    e.preventDefault();
    select((cur + next + tabs.length) % tabs.length, true);
  });
}
