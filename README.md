# Hari Traders: premium tile website

HTML5 · SCSS · Bootstrap 5 (grid) · GSAP + ScrollTrigger · Lenis · Webpack 5

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build into dist/
```

## Pages
- `index.html`: hero, pinned tile showcase, about, collections, featured, horizontal Spaces gallery, craft, applications, why us, CTA, contact
- `about.html`: brand story, values, process
- `collections.html`: the six collections, generated from the product data
- `products.html`: catalogue with search, multi-select filters (colour swatches, finish, size, material, application, category), chips, sort and a mobile bottom sheet. Filters sync to the URL (`?look=Marble&color=Grey`)
- `product.html?id=TILE-001`: detail page with texture zoom, layout and room views, specs, related tiles and a product-prefilled enquiry form
- `contact.html`: enquiry form, contact channels and FAQ

## Things to replace
- **Products:** `src/data/products.js`. All names and specs are sample data; filters and counts update automatically.
- **Business details:** phone, email, address, opening hours, WhatsApp and social links (search for `00000` / `haritraders.example`), plus `src/js/config.js`.
- **Enquiry forms:** set `formEndpoint` in `src/js/config.js` (Formspree, Getform or your own API). Until then forms open a pre-filled email.
- **Images:** tile textures are generated (`python tools/generate_assets.py`, 2000px). Swap in real tile photography using the same file names in `src/images/` (`tile-<code>.webp` plus `-sm`). Room photos are stock; replace them with brand photography.
- **Domain / SEO:** `SITE_URL` in `webpack.config.js`.

## Motion notes
Lenis is synced to ScrollTrigger (`src/js/smoothScroll.js`). Desktop and mobile use separate GSAP configs (`gsap.matchMedia`). `prefers-reduced-motion` disables Lenis, pinning and parallax and shows a static layout.
