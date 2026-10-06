import { q, qa } from './utils';
import { getLenis, scrollToTarget, lockScroll, unlockScroll } from './smoothScroll';

const norm = (p) => p.replace(/index\.html$/, '').replace(/\/$/, '');

export function initNavigation() {
  const nav = q('[data-nav]');
  const toggle = q('.nav__toggle');
  const menu = q('#menu');
  const page = document.documentElement.dataset.page;
  if (!nav) return;

  // --- active link
  qa('[data-nav-link]').forEach((a) => {
    if (a.dataset.navLink === page) a.setAttribute('aria-current', 'page');
  });

  qa('.menu__links a').forEach((a) => {
    const path = new URL(a.href, location.href).pathname.split('/').pop() || 'index.html';
    if (path === (location.pathname.split('/').pop() || 'index.html')) a.setAttribute('aria-current', 'page');
  });

  // --- scrolled state (solid + reduced height)
  const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
  getLenis()?.on('scroll', update);

  // --- mobile menu
  let open = false;
  const setMenu = (state) => {
    if (state === open) return;
    open = state;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menu.toggleAttribute('inert', !open);
    document.body.classList.toggle('menu-open', open);
    open ? lockScroll() : unlockScroll();
  };
  toggle?.addEventListener('click', () => setMenu(!open));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
  window.matchMedia('(min-width: 992px)').addEventListener('change', (e) => e.matches && setMenu(false));

  // --- in-page anchors (smooth, Lenis-aware); cross-page hash links navigate normally
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || norm(url.pathname) !== norm(location.pathname) || !url.hash) return;
    const el = url.hash === '#top' ? document.body : q(url.hash);
    if (!el) return;
    e.preventDefault();
    const wasOpen = open;
    setMenu(false);
    const go = () => scrollToTarget(url.hash === '#top' ? 0 : el, { offset: url.hash === '#top' ? 0 : -48 });
    wasOpen ? setTimeout(go, 60) : go();
    history.pushState(null, '', url.hash);
  });

  // land on a hash after navigating from another page
  if (location.hash && q(location.hash)) {
    window.addEventListener('load', () => setTimeout(() => scrollToTarget(q(location.hash), { offset: -48, immediate: true }), 80));
  }
}
