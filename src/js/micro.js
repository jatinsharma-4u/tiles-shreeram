import gsap from 'gsap';
import { qa, hasMotion } from './utils';

/** Small refinements: magnetic primary buttons (pointer devices) and page-leave transitions. */
export function initMicro() {
  if (!hasMotion()) return;

  // scroll progress hairline
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  const set = gsap.quickSetter(bar, 'scaleX');
  const upd = () => set(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
  window.addEventListener('scroll', upd, { passive: true });

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    qa('.btn--primary, .btn--light').forEach((btn) => {
      const x = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      const y = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.18);
        y((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      btn.addEventListener('pointerleave', () => (x(0), y(0)));
    });
  }

  // cursor-following label on image cards (desktop pointers only)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const tag = document.createElement('div');
    tag.className = 'cursor-label';
    tag.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tag);
    const x = gsap.quickTo(tag, 'x', { duration: 0.35, ease: 'power3.out' });
    const y = gsap.quickTo(tag, 'y', { duration: 0.35, ease: 'power3.out' });
    const SEL = '.pcard__media, .coll__media, .fcard__media, .space__media, .cl__media, .app__media';
    let on = false;
    document.addEventListener('pointermove', (e) => {
      const hit = e.target.closest?.(SEL);
      if (hit) {
        if (!on) {
          tag.textContent = hit.matches('.app__media') ? 'Explore' : 'View';
          gsap.set(tag, { x: e.clientX, y: e.clientY });
          tag.classList.add('is-on');
          on = true;
        }
        x(e.clientX);
        y(e.clientY);
      } else if (on) {
        tag.classList.remove('is-on');
        on = false;
      }
    });
    document.addEventListener('pointerleave', () => tag.classList.remove('is-on'));
  }

  // page transition: ivory wipe up over the page, navigate, then it lifts away on the next page
  const html = document.documentElement;
  if (html.classList.contains('veil-on')) {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        html.classList.add('veil-out');
        html.classList.remove('veil-on');
        setTimeout(() => html.classList.remove('veil-out'), 700);
      })
    );
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
    e.preventDefault();
    try {
      sessionStorage.setItem('ht-nav', '1');
    } catch (err) {
      /* storage unavailable, transition still plays on leave */
    }
    html.classList.add('veil-in');
    setTimeout(() => (location.href = url.href), 350);
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) html.classList.remove('veil-in', 'veil-on', 'veil-out');
  });
}
