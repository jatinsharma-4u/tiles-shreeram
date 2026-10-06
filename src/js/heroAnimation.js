import gsap from 'gsap';
import { q, qa, hasMotion } from './utils';

/**
 * Hero load sequence, quick and calm (~1s). The photograph is never animated.
 * Navigation and brand lead, then headline, copy and CTAs follow in a tight cascade.
 */
export function initHero() {
  const hero = q('.hero');
  if (!hero) return;
  const html = document.documentElement;

  if (!hasMotion()) {
    html.classList.add('is-loaded');
    return;
  }

  const lines = qa('.hero__title .ln > span', hero);
  const navKids = qa('.nav__bar > *');
  const chip = q('.hero__chip', hero);
  const cta = qa('.hero__cta > *', hero);
  const eyebrow = q('[data-hero="eyebrow"]', hero);
  const lead = q('[data-hero="lead"]', hero);

  gsap.set('[data-hero]', { opacity: 1 });
  gsap.set(lines, { yPercent: 110 });
  gsap.set([eyebrow, lead, ...cta], { opacity: 0, y: 14 });
  gsap.set(chip, { opacity: 0, y: 12 });
  gsap.set(navKids, { opacity: 0, y: -8 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => html.classList.add('is-loaded') });
  tl.to(navKids, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04 }, 0)
    .to(eyebrow, { opacity: 1, y: 0, duration: 0.5 }, 0.05)
    .to(lines, { yPercent: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, 0.1)
    .to(lead, { opacity: 1, y: 0, duration: 0.5 }, 0.3)
    .to(cta, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, 0.4)
    .to(chip, { opacity: 1, y: 0, duration: 0.6 }, 0.5);
}
