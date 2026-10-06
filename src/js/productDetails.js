import gsap from 'gsap';
import { PRODUCTS, byId, fmtSize, sceneFor, COLOR_HEX } from '../data/products';
import { q, qa, esc, hasMotion, cardHTML, arrowIcon } from './utils';
import { CONFIG } from './config';
import { initForms } from './contact';

const setMeta = (sel, attr, val) => {
  const el = q(sel);
  if (el) el.setAttribute(attr, val);
};

export function initProductPage() {
  const root = q('[data-pd-root]');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('id');
  const p = byId(id);

  if (!p) {
    document.title = 'Tile not found | Hari Traders';
    root.innerHTML = `<div class="wrap pd__notfound"><h1>We couldn't find that tile.</h1><p>It may have been renamed or removed.</p><a class="btn btn--primary" href="products.html"><span>Browse the catalogue</span></a></div>`;
    return;
  }

  // ---------- SEO
  const title = `${p.name} | ${p.collection} ${p.look} ${p.category.replace(' Tiles', '')} Tile | Hari Traders`;
  const desc = `${p.name} (${p.code}): ${p.finish.toLowerCase()} ${p.look.toLowerCase()}-look porcelain tile, ${fmtSize(p.size)} mm. ${p.tagline} Enquire online.`;
  const url = `${location.origin}${location.pathname}?id=${p.id}`;
  document.title = title;
  setMeta('meta[name="description"]', 'content', desc);
  setMeta('link[rel="canonical"]', 'href', url);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', desc);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[property="og:image"]', 'content', new URL(p.image, location.href).href);
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', desc);
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.code,
    description: p.description,
    image: new URL(p.image, location.href).href,
    brand: { '@type': 'Brand', name: 'Hari Traders' },
    category: `${p.look} ${p.category}`,
    color: p.color,
    material: 'Porcelain',
    size: `${fmtSize(p.size)} mm`,
  });
  document.head.appendChild(ld);

  // ---------- data
  const scene = sceneFor(p);
  const collection = PRODUCTS.filter((x) => x.collection === p.collection);
  const related = [...PRODUCTS.filter((x) => x.id !== p.id && x.look === p.look), ...PRODUCTS.filter((x) => x.id !== p.id && x.look !== p.look && x.application.some((a) => p.application.includes(a)))].slice(0, 4);
  const layoutCells = '<i></i>'.repeat(9);
  const facts = [
    ['Finish', p.finish],
    ['Size', `${fmtSize(p.size)} mm`],
    ['Thickness', `${p.thickness} mm`],
    ['Material', `${p.look} look · porcelain`],
    ['Colour', p.color],
    ['Application', p.application.join(', ')],
  ];

  root.innerHTML = `
    <nav class="wrap pd__crumbs" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span aria-hidden="true">/</span>
      <a href="products.html">Products</a><span aria-hidden="true">/</span>
      <a href="products.html?look=${encodeURIComponent(p.look)}">${esc(p.look)}</a><span aria-hidden="true">/</span>
      <span aria-current="page">${esc(p.name)}</span>
    </nav>

    <section class="wrap pd__top">
      <div class="pd__gallery">
        <div class="pd__main" data-main>
          <div class="pd__view is-active" data-view="tile"><img class="pd__tile-img" src="${p.image}" width="2000" height="2000" alt="${esc(p.name)}, ${esc(p.look.toLowerCase())}-look ${esc(p.finish.toLowerCase())} tile surface" fetchpriority="high"></div>
          <div class="pd__view" data-view="layout"><div class="pd__layout" style="--img:url(${p.image})">${layoutCells}</div></div>
          <div class="pd__view" data-view="room"><img src="images/${scene}.webp" width="1920" height="1280" alt="${esc(p.name)} in a ${esc(p.application[0].toLowerCase())} setting" loading="lazy"></div>
          <span class="pd__zoomhint" data-hint>Tap to zoom texture</span>
        </div>
        <div class="pd__thumbs" role="group" aria-label="Product views">
          <button type="button" aria-pressed="true" data-thumb="tile"><img src="${p.imageSm}" alt=""><span>Surface</span></button>
          <button type="button" aria-pressed="false" data-thumb="layout"><i style="background-image:url(${p.imageSm})"></i><span>Layout</span></button>
          <button type="button" aria-pressed="false" data-thumb="room"><img src="images/${scene}-sm.webp" alt=""><span>In the room</span></button>
        </div>
      </div>

      <div class="pd__info">
        <p class="eyebrow">${esc(p.collection)} · ${esc(p.look)}</p>
        <h1>${esc(p.name)}</h1>
        <span class="pd__code">Code ${esc(p.code)}</span>
        <p class="pd__desc">${esc(p.description)}</p>
        <dl class="pd__facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <div class="pd__colors">
          <h2>Available in the ${esc(p.collection)} collection</h2>
          <ul>${collection
            .map(
              (c) =>
                `<li><a href="product.html?id=${c.id}" title="${esc(c.name)}, ${esc(c.color)}" aria-label="${esc(c.name)}, ${esc(c.color)}" ${c.id === p.id ? 'aria-current="true"' : ''}><img src="${c.imageSm}" alt="" loading="lazy"></a></li>`
            )
            .join('')}</ul>
        </div>
        <div class="pd__ctas">
          <a class="btn btn--primary" href="#enquire"><span>Enquire about this tile</span></a>
          <a class="btn btn--ghost" href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(`Hi, I'd like to enquire about ${p.name} (${p.code}).`)}" target="_blank" rel="noopener"><span>WhatsApp</span></a>
        </div>
      </div>
    </section>

    <section class="wrap pd__specs" aria-labelledby="specs-h">
      <h2 id="specs-h">Technical specifications</h2>
      <dl>
        <div><dt>Product code</dt><dd>${esc(p.code)}</dd></div>
        <div><dt>Collection</dt><dd>${esc(p.collection)}</dd></div>
        <div><dt>Category</dt><dd>${esc(p.category)}</dd></div>
        <div><dt>Finish</dt><dd>${esc(p.finish)}</dd></div>
        <div><dt>Nominal size</dt><dd>${fmtSize(p.size)} mm</dd></div>
        <div><dt>Thickness</dt><dd>${p.thickness} mm</dd></div>
        ${Object.entries(p.specs).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
    </section>

    <section class="wrap pd__related" aria-labelledby="rel-h">
      <h2 id="rel-h">You may also like</h2>
      <div class="pgrid pgrid--4">${related.map(cardHTML).join('')}</div>
    </section>

    <div class="pd__sticky" data-sticky><div><strong>${esc(p.name)}</strong><small>${esc(p.collection)} · ${esc(p.finish)} · ${fmtSize(p.size)}</small></div><div class="pd__sticky-btns"><a class="btn btn--ghost btn--sm" href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(`Hi, I'd like to enquire about ${p.name} (${p.code}).`)}" target="_blank" rel="noopener" aria-label="WhatsApp"><span>Chat</span></a><a class="btn btn--primary btn--sm" href="#enquire"><span>Enquire now</span></a></div></div>

    <section class="pd__enquire" id="enquire">
      <div class="wrap">
        <div class="row gy-5">
          <div class="col-lg-5">
            <p class="eyebrow eyebrow--num"><span>→</span> Enquire</p>
            <h2>Interested in<br>${esc(p.name)}?</h2>
            <p class="lead">Tell us how much you need and where it's going. We'll confirm availability and send a quote.</p>
            <div class="pd__sel"><img src="${p.imageSm}" alt=""><div><span>${esc(p.collection)} · ${esc(p.look)}</span><strong>${esc(p.name)}</strong><small>${esc(p.finish)} • ${fmtSize(p.size)} mm</small></div></div>
          </div>
          <div class="col-lg-6 offset-lg-1">
            <form class="form" data-form="product" novalidate>
              <div class="form__grid">
                <div class="field field--full"><label for="e-prod">Product</label><input id="e-prod" name="product" type="text" value="${esc(p.name)} (${esc(p.code)})" readonly></div>
                <div class="field"><label for="e-name">Full name</label><input id="e-name" name="name" type="text" autocomplete="name" required><p class="field__err" aria-live="polite"></p></div>
                <div class="field"><label for="e-phone">Phone</label><input id="e-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required><p class="field__err" aria-live="polite"></p></div>
                <div class="field"><label for="e-email">Email</label><input id="e-email" name="email" type="email" autocomplete="email" required><p class="field__err" aria-live="polite"></p></div>
                <div class="field"><label for="e-city">City</label><input id="e-city" name="city" type="text" autocomplete="address-level2" required><p class="field__err" aria-live="polite"></p></div>
                <div class="field field--full"><label for="e-qty">Quantity (sq. ft or boxes)</label><input id="e-qty" name="quantity" type="text" inputmode="numeric" placeholder="e.g. 850 sq. ft"></div>
                <div class="field field--full"><label for="e-msg">Message</label><textarea id="e-msg" name="message" rows="3"></textarea></div>
              </div>
              <button class="btn btn--primary btn--block" type="submit"><span>Send enquiry</span>${arrowIcon.replace('<svg', '<svg class="btn__arr"')}</button>
              <p class="form__status" role="status" aria-live="polite" data-form-status></p>
            </form>
          </div>
        </div>
      </div>
    </section>`;

  // layout view: set the tile image on each cell
  qa('.pd__layout i', root).forEach((i) => (i.style.backgroundImage = `url(${p.image})`));

  // ---------- gallery
  const main = q('[data-main]', root);
  const hint = q('[data-hint]', root);
  const views = qa('[data-view]', main);
  const thumbs = qa('[data-thumb]', root);
  const tileImg = q('.pd__tile-img', main);
  let view = 'tile';
  const setView = (v) => {
    view = v;
    main.classList.remove('is-zoom');
    views.forEach((el) => el.classList.toggle('is-active', el.dataset.view === v));
    thumbs.forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.thumb === v)));
    hint.hidden = v !== 'tile';
    main.style.cursor = v === 'tile' ? '' : 'default';
  };
  thumbs.forEach((t) => t.addEventListener('click', () => setView(t.dataset.thumb)));

  const origin = (e) => {
    const r = main.getBoundingClientRect();
    tileImg.style.setProperty('--ox', `${((e.clientX - r.left) / r.width) * 100}%`);
    tileImg.style.setProperty('--oy', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  main.addEventListener('click', (e) => {
    if (view !== 'tile') return;
    origin(e);
    const on = main.classList.toggle('is-zoom');
    hint.textContent = on ? 'Tap to zoom out' : 'Tap to zoom texture';
  });
  main.addEventListener('pointermove', (e) => main.classList.contains('is-zoom') && origin(e));

  if (hasMotion()) {
    gsap.from(['.pd__info > *', '.pd__main'], { autoAlpha: 0, y: 24, duration: 1, stagger: 0.07, ease: 'power3.out', delay: 0.1 });
  }

  // mobile sticky enquiry bar: visible once the main CTA scrolls away, hidden over the form
  const sticky = q('[data-sticky]', root);
  const form = q('#enquire', root);
  new IntersectionObserver(([e]) => sticky.classList.toggle('is-visible', !e.isIntersecting)).observe(form);
  sticky.classList.add('is-visible');
  document.body.classList.add('has-sticky');

  initForms(root, { productName: `${p.name} (${p.code})` });
}
