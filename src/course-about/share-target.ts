import { getSiteConfig } from '@openedx/frontend-base';

import type { ShareTarget } from './types';

/**
 * Resolves a raw share target into the policy for the current render.
 *
 * An omitted value means the current page and deliberately captures no URL,
 * so the link is built from the live location. Any other value must be an
 * absolute http(s) URL or a site-root-relative path: blank text, `#`, other
 * schemes and unparseable values are unusable as a target, so sharing is
 * hidden rather than pointed at the wrong place.
 */
export const resolveShareTarget = (shareUrl?: string | null): ShareTarget => {
  if (shareUrl === undefined) {
    return { kind: 'current-page' };
  }

  const candidate = shareUrl?.trim() ?? '';
  const isAbsolute = /^https?:\/\//i.test(candidate);
  if (!isAbsolute && !/^(\/|\.\/|\.\.\/)/.test(candidate)) {
    return { kind: 'hidden' };
  }

  try {
    const resolved = new URL(candidate, getSiteConfig().baseUrl);
    return resolved.protocol === 'http:' || resolved.protocol === 'https:'
      ? { kind: 'url', href: resolved.href }
      : { kind: 'hidden' };
  } catch {
    return { kind: 'hidden' };
  }
};
