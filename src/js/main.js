import '../scss/main.scss';
import { initSmoothScroll } from './smoothScroll';
import { initNavigation } from './navigation';
import { initForms } from './contact';
import { initStats } from './homeSections';
import { initMicro } from './micro';
import { initHero } from './heroAnimation';
import { initDropdowns } from './dropdown';

const page = document.documentElement.dataset.page;

async function boot() {
  // 1. smooth scroll first so every ScrollTrigger measures against the same scroller
  initSmoothScroll();
  initNavigation();
  initStats();
  initDropdowns();
  initForms();
  initMicro();
  if (page === 'home') initHero(); // run immediately, don't wait for the other home chunks

  if (page === 'home') {
    // page-specific code is split into its own chunk
    const [{ initShowcase }, { initScrollScenes }, { initFeatured, initApplications }, { initSpaces }] = await Promise.all([
      import(/* webpackChunkName: "home" */ './productShowcase'),
      import(/* webpackChunkName: "home" */ './scrollScenes'),
      import(/* webpackChunkName: "home" */ './homeSections'),
      import(/* webpackChunkName: "home" */ './spacesGallery'),
    ]);
    initFeatured();
    initApplications();
    // pin first, then everything that sits below it (see refreshPriority)
    initShowcase();
    initSpaces();
    initScrollScenes();
  }

  if (['about', 'collections', 'contact'].includes(page)) {
    if (page === 'collections') (await import(/* webpackChunkName: "collections" */ './collectionsPage')).initCollectionsPage();
    const { initScrollScenes } = await import(/* webpackChunkName: "home" */ './scrollScenes');
    initScrollScenes();
  }

  if (page === 'catalogue') {
    const { initCatalogue } = await import(/* webpackChunkName: "catalogue" */ './productFilters');
    initCatalogue();
  }

  if (page === 'product') {
    const { initProductPage } = await import(/* webpackChunkName: "product" */ './productDetails');
    initProductPage();
  }

  if (page !== 'home' || !document.documentElement.classList.contains('motion')) {
    document.documentElement.classList.add('is-loaded');
  }
}

boot();
