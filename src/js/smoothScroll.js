import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hasMotion } from './utils';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
let locks = 0;

/** Lenis ↔ ScrollTrigger sync. Skipped entirely under prefers-reduced-motion. */
export function initSmoothScroll() {
  if (!hasMotion() || lenis) return lenis;
  lenis = new Lenis({
    lerp: 0.11, // responsive, not floaty
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false, // native momentum on touch devices
    autoRaf: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = () => lenis;

export function scrollToTarget(target, { offset = 0, immediate = false } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset, immediate, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: 'auto' });
  }
}

/** Reference-counted scroll lock (menu, filter sheet). */
export function lockScroll() {
  if (locks++ === 0) {
    lenis?.stop();
    document.body.style.overflow = 'hidden';
  }
}
export function unlockScroll() {
  if (locks > 0 && --locks === 0) {
    lenis?.start();
    document.body.style.overflow = '';
  }
}
