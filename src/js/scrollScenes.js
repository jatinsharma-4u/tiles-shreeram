import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { q, qa, hasMotion, splitWords, splitScrub } from './utils';

gsap.registerPlugin(ScrollTrigger);

/**
 * Generic scroll storytelling: text reveals, fades, parallax layers, section continuity.
 * Desktop and mobile use separate configurations (gsap.matchMedia) with reduced distances on touch.
 */
export function initScrollScenes() {
  if (!hasMotion()) return;

  // Prepare split text once (outside matchMedia so it survives breakpoint changes)
  const wordHeads = qa('[data-reveal="words"]').map((el) => ({ el, words: splitWords(el) }));
  const statement = q('[data-scrub-words]');
  const statementWords = statement ? splitScrub(statement) : [];

  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: '(min-width: 992px)',
      mobile: '(max-width: 991.98px)',
    },
    (ctx) => {
      const { desktop } = ctx.conditions;
      const dist = desktop ? 1 : 0.55; // movement multiplier

      // ---- headline reveals
      wordHeads.forEach(({ el, words }) => {
        gsap.set(words, { yPercent: 112 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.15, stagger: 0.05, ease: 'expo.out' }),
        });
      });

      // ---- brand statement: words light up with scroll
      if (statementWords.length) {
        gsap.set(statementWords, { opacity: 0.16 });
        gsap.to(statementWords, {
          opacity: 1,
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: { trigger: statement, start: 'top 82%', end: desktop ? 'bottom 45%' : 'bottom 55%', scrub: true },
        });
      }

      // ---- fades (batched so adjacent items cascade)
      const fades = qa('[data-fade]');
      gsap.set(fades, { autoAlpha: 0, y: 32 * dist });
      ScrollTrigger.batch(fades, {
        start: 'top 92%',
        once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.09, ease: 'power3.out', overwrite: true }),
      });

      // ---- hero depth: photograph drifts slower than the copy
      const hero = q('.hero');
      if (hero) {
        const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
        gsap.to('.hero__slide img', { yPercent: 7 * dist, ease: 'none', scrollTrigger: st });
        gsap.to('.hero__copy', { y: -50 * dist, opacity: 0.2, ease: 'none', scrollTrigger: st });
      }

      // ---- collections: clip-reveal + inner parallax
      qa('.coll').forEach((card) => {
        const media = q('.coll__media', card);
        const img = q('img', media);
        gsap.fromTo(media, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
        gsap.fromTo(img, { yPercent: -4 * dist }, { yPercent: 4 * dist, ease: 'none', scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true } });
      });

      // ---- page banner (about): slow zoom-out as it enters
      const band = q('[data-band] img');
      if (band) gsap.fromTo(band, { scale: 1.18, yPercent: -4 * dist }, { scale: 1, yPercent: 4 * dist, ease: 'none', scrollTrigger: { trigger: '[data-band]', start: 'top 85%', end: 'bottom top', scrub: true } });

      // ---- featured cards
      qa('.fcard').forEach((card) => {
        const media = q('.fcard__media', card);
        gsap.fromTo(media, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
      });

      // ---- craft: macro texture zoom + mask reveal
      const craft = q('[data-craft]');
      if (craft) {
        const img = q('img', craft);
        gsap.fromTo(craft, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: craft, start: 'top 85%', once: true } });
        gsap.fromTo(img, { scale: 1 }, { scale: desktop ? 1.45 : 1.2, ease: 'none', scrollTrigger: { trigger: craft, start: 'top 80%', end: 'bottom 20%', scrub: true } });
      }

      // ---- architectural parallax: background slow, swatch fast, copy controlled
      const arch = q('[data-arch]');
      if (arch) {
        const st = { trigger: arch, start: 'top bottom', end: 'bottom top', scrub: true };
        gsap.fromTo('[data-arch-bg] img', { yPercent: -8 * dist }, { yPercent: 8 * dist, ease: 'none', scrollTrigger: st });
        gsap.fromTo('[data-arch-swatch]', { y: 140 * dist }, { y: -160 * dist, rotation: desktop ? 4 : 0, ease: 'none', scrollTrigger: st });
        gsap.fromTo('.arch__copy', { y: 60 * dist }, { y: -30 * dist, ease: 'none', scrollTrigger: st });
      }
    }
  );

  // Make sure measurements are right once images/fonts have settled
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
