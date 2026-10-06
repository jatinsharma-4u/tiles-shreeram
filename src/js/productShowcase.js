import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { q, qa, hasMotion } from './utils';

gsap.registerPlugin(ScrollTrigger);

/**
 * Signature interaction, pinned, scroll-scrubbed tile showcase.
 *
 * Every movement is tied to scroll position (scrub) and paced slowly: each tile gets
 * ~1.5 screens of scroll. Stages overlap so nothing starts or stops abruptly:
 *
 *   enter (soft rise + scale) → texture zoom → room dissolves in behind the tile →
 *   tile settles into a swatch → product details → hand-off to the next tile.
 */
export function initShowcase() {
  const stage = q('[data-showcase]');
  if (!stage || !hasMotion()) return;

  const items = qa('[data-sc-item]', stage).map((el) => ({
    el,
    scene: q('.sc-scene', el),
    sceneImg: q('.sc-scene img', el),
    tile: q('.sc-tile', el),
    img: q('.sc-tile__frame img', el),
    cap: q('.sc-tile__cap', el),
    info: q('.sc-info', el),
  }));
  const N = items.length;
  const bar = q('[data-sc-bar]', stage);
  const num = q('[data-sc-num]', stage);
  const hint = q('.showcase__hint', stage);

  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 992px)', tablet: '(min-width: 576px) and (max-width: 991.98px)', mobile: '(max-width: 575.98px)' }, (ctx) => {
    const { desktop, mobile } = ctx.conditions;
    // separate tuning per breakpoint, smaller zoom + shorter scroll on touch screens
    const cfg = desktop
      ? { zoom: 1.7, swatch: 0.3, vh: 1.55, rise: 0.05, from: 0.9 }
      : mobile
        ? { zoom: 1.45, swatch: 0.26, vh: 1.2, rise: 0.035, from: 0.92 }
        : { zoom: 1.6, swatch: 0.28, vh: 1.35, rise: 0.04, from: 0.9 };

    const H = () => stage.clientHeight;
    const W = () => stage.clientWidth;
    const gutter = () => parseFloat(getComputedStyle(stage).getPropertyValue('--gut')) || 24;

    items.forEach(({ scene, tile, info, sceneImg }) => {
      gsap.set(tile, { xPercent: -50, yPercent: -50, autoAlpha: 0, transformOrigin: '50% 50%' });
      gsap.set(scene, { autoAlpha: 0 });
      gsap.set(info, { autoAlpha: 0 });
      gsap.set(sceneImg, { scale: 1.12 });
    });

    // swatch rests bottom-right (desktop/tablet) or top-right (phones, clear of the info card)
    const swatchX = (t) => () => W() - (desktop ? gutter() : 16) - (t.offsetWidth * cfg.swatch) / 2 - W() / 2;
    const swatchY = (t) => () => {
      const th = t.offsetHeight * cfg.swatch;
      const cy = desktop ? H() - H() * 0.1 - th / 2 : 84 + th / 2;
      return cy - H() * 0.52;
    };

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: () => `+=${Math.round(N * cfg.vh * window.innerHeight)}`,
        pin: true,
        scrub: 1, // a full second of smoothing keeps the motion fluid on top of Lenis
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 1,
        onUpdate: (self) => {
          const i = Math.min(N - 1, Math.max(0, Math.floor(self.progress * N + 0.15)));
          const label = String(i + 1).padStart(2, '0');
          if (num.textContent !== label) num.textContent = label;
        },
      },
    });

    tl.to(hint, { autoAlpha: 0, duration: 0.08 }, 0.04);
    tl.to(bar, { scaleX: 1, duration: N }, 0);

    items.forEach((it, i) => {
      const T = i;
      const first = i === 0;

      // 1, enter: a soft rise and scale, no rotation
      tl.fromTo(
        it.tile,
        { autoAlpha: first ? 1 : 0, y: () => H() * cfg.rise, scale: cfg.from },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' },
        T
      );

      // previous composition dissolves out while this tile arrives
      if (!first) {
        const p = items[i - 1];
        tl.to(p.info, { autoAlpha: 0, y: -16, duration: 0.12, ease: 'power1.in' }, T - 0.1)
          .to(p.scene, { autoAlpha: 0, duration: 0.3, ease: 'power1.inOut' }, T)
          .to(p.tile, { autoAlpha: 0, duration: 0.22, ease: 'power1.inOut' }, T);
      }

      // 2, texture zoom: slow, even, readable
      tl.fromTo(it.img, { scale: 1 }, { scale: cfg.zoom, duration: 0.3, ease: 'power1.inOut' }, T + 0.28);
      tl.fromTo(it.cap, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, T + 0.34).to(it.cap, { autoAlpha: 0, duration: 0.08 }, T + 0.52);

      // 3, the room fades in behind the tile; the tile eases back and settles as a swatch
      tl.fromTo(it.scene, { autoAlpha: 0, clipPath: 'inset(7% 12% 7% 12%)' }, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.34, ease: 'power1.inOut' }, T + 0.52);
      tl.to(it.sceneImg, { scale: 1, duration: 0.48, ease: 'power1.out' }, T + 0.52);
      tl.to(it.img, { scale: 1, duration: 0.26, ease: 'power1.inOut' }, T + 0.58);
      tl.to(it.tile, { x: swatchX(it.tile), y: swatchY(it.tile), scale: cfg.swatch, duration: 0.3, ease: 'power2.inOut' }, T + 0.58);

      // 4, product information
      tl.fromTo(it.info, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out' }, T + 0.76);
    });

    tl.to({}, { duration: 0.0001 }, N);

    return () => {
      gsap.set([...items.flatMap((it) => [it.tile, it.scene, it.info, it.sceneImg, it.img, it.cap]), bar, hint], { clearProps: 'all' });
    };
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}
