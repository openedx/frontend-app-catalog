import type { Icon } from '@openedx/paragon';

/**
 * Where a share control should point for the current render. `current-page`
 * defers to the live location when the links are built; `hidden` means no
 * target is available, so sharing is not offered at all.
 */
export type ShareTarget =
  | { kind: 'current-page' }
  | { kind: 'url'; href: string }
  | { kind: 'hidden' };

/** One rendered share control. Shape shared with the Course About sidebar social Adapter. */
export interface ShareLink {
  id: string;
  destination: string;
  icon: typeof Icon;
  screenReaderText: string;
}

/**
 * Everything a host supplies in its own words. The URL-bearing entries receive
 * the same resolved target the destinations are built from, so copy and link
 * cannot disagree. The Module never invents or translates copy.
 */
export interface ShareCopy {
  twitterLabel: string;
  facebookLabel: string;
  emailLabel: string;
  twitterText: (url: string) => string;
  /** Carries no URL. */
  emailSubject: string;
  emailBody: (url: string) => string;
}

export interface ShareLinksResult {
  /** Empty when the target is hidden. */
  links: ShareLink[];
  /**
   * The validated absolute href the links were built from, or null when
   * hidden. Exposed for hosts that render their own control, or that need to
   * keep the links and a separately forwarded share policy in agreement;
   * hosts that only render `ShareLinks` need `links` alone.
   */
  target: string | null;
}
