import { useEffect, useRef, useState } from 'react';

import { SECTION_NAV_ITEMS } from '../sections';

interface PathwayNavigation {
  activeSection: string;
  isNavSticky: boolean;
  selectSection: (sectionId: string) => void;
}

/** Reads the section id out of a `#hash`, defaulting to the About section. */
const getInitialSection = () => {
  const initialSection = window.location.hash.slice(1);
  return SECTION_NAV_ITEMS.some(({ id }) => id === initialSection) ? initialSection : 'about';
};

/**
 * Page-local navigation state: the active section (scrollspy + tab clicks) and
 * whether the sticky bar is pinned. Owns the IntersectionObserver, the panel
 * height measurement and the hash sync for the pathway detail page.
 */
export const usePathwayNavigation = (): PathwayNavigation => {
  const [activeSection, setActiveSection] = useState<string>(getInitialSection);
  // True while the sticky bar is pinned at the viewport top, which is when it
  // takes over the summary (name, call to action, start date) from the hero.
  const [isNavSticky, setIsNavSticky] = useState(false);
  const intersectingSections = useRef(new Set<string>());

  // Page-local scrollspy: one IntersectionObserver watches the section
  // targets. The sticky panel is measured and its height is written back to
  // --pathway-detail-nav-height on the page element, the same custom property
  // scroll-margin-top uses, so the JS and CSS offsets cannot drift. The
  // stylesheet value stays as the pre-measure fallback.
  useEffect(() => {
    // Paragon Nav does not forward refs to its DOM element, so resolve it
    // directly; this page renders exactly one sticky panel.
    const nav = document.querySelector<HTMLElement>('.pathway-detail-nav');
    const page = document.querySelector<HTMLElement>('.pathway-detail-page');
    const sections = SECTION_NAV_ITEMS
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    if (!nav || !page || sections.length === 0) {
      return undefined;
    }

    let stickyBoundary = 0;
    let observer: IntersectionObserver | undefined;

    // Layout may be absent (jsdom, prerender), so a zero measurement keeps the
    // stylesheet's --pathway-detail-nav-height instead of collapsing the offset.
    const measureBoundary = () => {
      const { height } = nav.getBoundingClientRect();
      if (height > 0) {
        page.style.setProperty('--pathway-detail-nav-height', `${height}px`);
        return height;
      }

      const cssHeight = parseFloat(getComputedStyle(page).getPropertyValue('--pathway-detail-nav-height'));
      return Number.isFinite(cssHeight) ? cssHeight : 0;
    };

    // Mirror the active section in the URL hash without adding a history
    // entry per scroll event; pathname and query are preserved. This runs
    // before setActiveSection so the re-render reads the already-synced URL
    // (share destinations are built from window.location.href).
    const syncHash = (sectionId: string) => {
      const hash = `#${sectionId}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${hash}`);
      }
    };

    const observeSections = () => {
      // The rebuilt observer replays its own initial entries; stale ids from the
      // previous instance must not survive into that first callback.
      intersectingSections.current.clear();
      stickyBoundary = measureBoundary();
      observer?.disconnect();
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            intersectingSections.current.add(entry.target.id);
          } else {
            intersectingSections.current.delete(entry.target.id);
          }
        });

        // Several sections can intersect at once. Pick the one nearest the
        // sticky boundary (the panel's bottom edge); a strictly-smaller
        // comparison keeps the first matching section on ties, so the choice
        // is deterministic and does not flicker. Geometry is read fresh from
        // the live DOM: entry.boundingClientRect is stale between callbacks.
        let nearestId: string | undefined;
        let nearestDistance = Infinity;
        SECTION_NAV_ITEMS.forEach(({ id }) => {
          if (!intersectingSections.current.has(id)) {
            return;
          }
          const section = document.getElementById(id);
          if (!section) {
            return;
          }
          const distance = Math.abs(section.getBoundingClientRect().top - stickyBoundary);
          if (distance < nearestDistance) {
            nearestId = id;
            nearestDistance = distance;
          }
        });
        // Keep the current section active while none intersect (e.g. the page
        // footer) rather than flickering the active link off.
        if (nearestId) {
          syncHash(nearestId);
          setActiveSection(nearestId);
        }
      }, { rootMargin: `-${stickyBoundary}px 0px 0px 0px` });
      sections.forEach((section) => observer?.observe(section));
    };

    observeSections();

    // Rebuild only when the measured height really moves (breakpoint stacking,
    // font loading); a stable height must not disconnect/reconnect per event.
    const handleResize = () => {
      const { height } = nav.getBoundingClientRect();
      if (height > 0 && Math.abs(height - stickyBoundary) >= 1) {
        observeSections();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
    // The summary mounts and unmounts with the sticky state, so the panel
    // height - and therefore the boundary - is re-measured on every toggle.
  }, [isNavSticky]);

  // Detect whether the sticky bar is actually pinned. A level check keeps both
  // scroll directions and hash loads correct; bottom > 0 keeps jsdom's zero
  // rect (no layout) reporting "not stuck", which is the collapsed initial state.
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('.pathway-detail-nav');
    if (!nav) {
      return undefined;
    }

    const updateStuck = () => {
      const { top, bottom } = nav.getBoundingClientRect();
      setIsNavSticky(top <= 0 && bottom > 0);
    };

    updateStuck();
    window.addEventListener('scroll', updateStuck, { passive: true });
    window.addEventListener('resize', updateStuck);

    return () => {
      window.removeEventListener('scroll', updateStuck);
      window.removeEventListener('resize', updateStuck);
    };
  }, []);

  return { activeSection, isNavSticky, selectSection: setActiveSection };
};
