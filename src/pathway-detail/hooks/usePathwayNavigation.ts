import { useEffect, useRef, useState } from 'react';

import { SECTION_NAV_ITEMS } from '../sections';

interface PathwayNavigation {
  activeSection: string;
  isNavSticky: boolean;
  selectSection: (sectionId: string) => void;
}

/** The section named by a `#hash`, or null when absent or unknown. */
const getSectionFromHash = (hash: string): string | null => {
  const sectionId = hash.slice(1);
  return SECTION_NAV_ITEMS.some(({ id }) => id === sectionId) ? sectionId : null;
};

/**
 * Mirrors a section in the address without adding a history entry; pathname and
 * query are kept. Called before the state update so the resulting render, which
 * builds share destinations from the address, reads the new hash.
 */
const replaceHash = (sectionId: string) => {
  const hash = `#${sectionId}`;
  if (window.location.hash !== hash) {
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${hash}`);
  }
};

/**
 * Page-local navigation state: the active section (scrollspy + tab clicks) and
 * whether the sticky bar is pinned. Owns the IntersectionObserver, the panel
 * height measurement and the hash sync for the pathway detail page.
 */
export const usePathwayNavigation = (): PathwayNavigation => {
  // Read once at mount: only a real deep link needs the anchor scroll and the
  // first-observer hash skip.
  const initialSection = useRef<string | null>(getSectionFromHash(window.location.hash));
  // Seeded from the mount hash so a rebuilt observer still skips its first delivery.
  const preserveInitialHash = useRef(initialSection.current !== null);
  // The address's section hash, held in state so synchronizing a different hash
  // re-renders even when the derived section is unchanged (e.g. '' -> '#about').
  const [activeHash, setActiveHash] = useState<string>(() => window.location.hash);
  // Derived, not stored: an absent or unknown hash shows the first tab.
  const activeSection = getSectionFromHash(activeHash) ?? SECTION_NAV_ITEMS[0].id;
  // True while the sticky bar is pinned at the viewport top, which is when it
  // takes over the summary (name, call to action, start date) from the hero.
  const [isNavSticky, setIsNavSticky] = useState(false);
  const intersectingSections = useRef(new Set<string>());
  // Height used by the last alignment; an unchanged height must not scroll again.
  const alignedAtHeight = useRef<number | null>(null);

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

    /**
     * Scrolls a deep link into place before the observer exists, so its first
     * observation already reflects the anchored position, then once more on the
     * [isNavSticky] pass that applies the taller pinned summary.
     */
    const alignInitialSection = () => {
      if (!initialSection.current) {
        return;
      }

      const target = document.getElementById(initialSection.current);
      if (!target) {
        initialSection.current = null;
        return;
      }

      const heightGrew = alignedAtHeight.current !== null && stickyBoundary > alignedAtHeight.current;
      if (alignedAtHeight.current === null || heightGrew) {
        // Honours the section's scroll-margin-top, written from this same measurement.
        target.scrollIntoView?.({ block: 'start', behavior: 'instant' });
        alignedAtHeight.current = stickyBoundary;
      }

      // Done on the expanded pass, or when the scroll left the bar unpinned, so no
      // summary will mount; a pinned bar with isNavSticky still false keeps it.
      const { top, bottom } = nav.getBoundingClientRect();
      if (isNavSticky || !(top <= 0 && bottom > 0)) {
        initialSection.current = null;
      }
    };

    const observeSections = () => {
      // The rebuilt observer replays its own initial entries; stale ids from the
      // previous instance must not survive into that first callback.
      intersectingSections.current.clear();
      stickyBoundary = measureBoundary();
      observer?.disconnect();
      // Captured before aligning: the expanded pass still needs its skip even though
      // alignInitialSection() clears the request during that same pass.
      let skipFirstSync = preserveInitialHash.current || initialSection.current !== null;
      alignInitialSection();
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            intersectingSections.current.add(entry.target.id);
          } else {
            intersectingSections.current.delete(entry.target.id);
          }
        });

        // A clamped scroll can leave About nearest the boundary. The URL already
        // names the requested section, so this first delivery must not rewrite it.
        if (skipFirstSync) {
          skipFirstSync = false;
          preserveInitialHash.current = false;
          return;
        }

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
          // Address first, then the hash state: the render reads the new address
          // and refreshes share destinations even when the section is unchanged.
          replaceHash(nearestId);
          setActiveHash(`#${nearestId}`);
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

  // A tab click is real fragment navigation: assign the hash before the state
  // update so the render that activates the tab also builds share destinations
  // from the new address. The assignment pushes the history entry and scrolls
  // the section into view like the anchor, whose default then finds that
  // address unchanged.
  const selectSection = (sectionId: string) => {
    const hash = `#${sectionId}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
    setActiveHash(hash);
  };

  return { activeSection, isNavSticky, selectSection };
};
