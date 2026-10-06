import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { q, hasMotion } from './utils';

gsap.registerPlugin(ScrollTrigger);

/** Desktop: vertical scroll drives a horizontal pan (pinned). Mobile: native swipe with scroll-snap. */
export function initSpaces() {
  const root = q('[data-spaces]');
  if (!root || !hasMotion()) return;
  const pin = q('[data-spaces-pin]', root);
  const track = q('[data-spaces-track]', root);

  const bar = q('[data-spaces-bar]', root);

  // Desktop: pinned; vertical scroll drives horizontal travel until the last card is fully in view, then the pin releases.
  // Phones/tablets use native swipe + snap (see CSS), no pinning, nothing to fight the thumb.
  gsap.matchMedia().add('(min-width: 992px)', () => {
    // travel exactly far enough for the last card to sit fully in view with a right-hand gutter
    const dist = () => {
      const last = track.lastElementChild;
      const gut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gut')) || 48;
      return Math.max(0, last.offsetLeft + last.offsetWidth + gut - window.innerWidth);
    };
    gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => `+=${Math.round(dist() * 1.2)}`, // a little extra scroll so the pace stays calm
        pin,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => bar && (bar.style.transform = `scaleX(${self.progress})`),
      },
    });
  });

  // Touch layouts: keep the progress hairline in sync with the native scroller
  gsap.matchMedia().add('(max-width: 991.98px)', () => {
    if (!bar) return;
    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth;
      bar.style.transform = `scaleX(${max > 0 ? track.scrollLeft / max : 0})`;
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => track.removeEventListener('scroll', onScroll);
  });
}
