import { PRODUCTS, COLLECTIONS, fmtSize } from '../data/products';
import { q, esc, arrowIcon } from './utils';

const SCENES = {
  Marble: 'scene-bathroom-white',
  Stone: 'scene-living-cream',
  Concrete: 'scene-commercial',
  Wood: 'scene-living-oak',
  Terrazzo: 'scene-kitchen',
  Metal: 'scene-bathroom-dark',
};

/** Editorial list of every collection, generated from the product data. */
export function initCollectionsPage() {
  const root = q('[data-collections-list]');
  if (!root) return;
  const looks = Object.keys(COLLECTIONS);

  const jump = q('[data-jump]');
  if (jump) jump.innerHTML = looks.map((l) => `<a href="#${l.toLowerCase()}">${COLLECTIONS[l].name}<span>${l}</span></a>`).join('');

  root.innerHTML = looks
    .map((look, i) => {
      const c = COLLECTIONS[look];
      const items = PRODUCTS.filter((p) => p.look === look);
      const finishes = [...new Set(items.map((p) => p.finish))].join(' · ');
      const sizes = [...new Set(items.map((p) => p.size))].map((s) => fmtSize(s)).join(' · ');
      const colors = [...new Set(items.map((p) => p.color))].join(', ');
      const scene = SCENES[look];
      return `
      <article class="cl${i % 2 ? ' cl--rev' : ''}" id="${look.toLowerCase()}" aria-labelledby="cl-${i}">
        <a class="cl__media" href="products.html?look=${look}" aria-label="View the ${esc(c.name)} collection">
          <img src="images/${scene}-sm.webp" srcset="images/${scene}-sm.webp 900w, images/${scene}.webp 1920w, images/${scene}-lg.webp 2880w" sizes="(min-width: 992px) 52vw, 100vw" width="1920" height="1280" alt="${esc(look)}-look tiles in a ${esc(items[0].application[0].toLowerCase())} interior" loading="${i < 1 ? 'eager' : 'lazy'}" decoding="async">
          <span class="cl__swatches" aria-hidden="true">${items
            .slice(0, 4)
            .map((p) => `<img src="${p.imageSm}" alt="" width="640" height="640" loading="lazy">`)
            .join('')}</span>
        </a>
        <div class="cl__body">
          <p class="cl__n">${String(i + 1).padStart(2, '0')}, ${esc(look)}</p>
          <h2 id="cl-${i}" data-reveal="words">${esc(c.name)}</h2>
          <p class="cl__blurb" data-fade>${esc(c.blurb)}</p>
          <dl class="cl__meta" data-fade>
            <div><dt>Designs</dt><dd>${items.length}</dd></div>
            <div><dt>Finishes</dt><dd>${esc(finishes)}</dd></div>
            <div><dt>Sizes (mm)</dt><dd>${esc(sizes)}</dd></div>
            <div><dt>Colours</dt><dd>${esc(colors)}</dd></div>
          </dl>
          <div class="cl__cta" data-fade>
            <a class="btn btn--primary" href="products.html?look=${look}"><span>View collection</span><svg class="btn__arr" aria-hidden="true"><use href="#i-arrow"/></svg></a>
          </div>
        </div>
      </article>`;
    })
    .join('');
}
