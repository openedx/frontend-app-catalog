import { getSiteConfig } from '@openedx/frontend-base';
import {
  BsFacebook as BsFacebookIcon,
  BsTwitterX as BsTwitterXIcon,
  Email as EmailIcon,
} from '@openedx/paragon/icons';

import type {
  ShareCopy, ShareLink, ShareLinksResult, ShareTarget,
} from './types';

const twitterDestination = (text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
const facebookDestination = (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
const emailDestination = (subject: string, body: string) => `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/**
 * A usable target is a well-formed absolute http(s) URL; anything else (another
 * scheme, malformed text, or a path that is not absolute on its own) returns
 * null so the caller hides sharing instead of pointing somewhere wrong.
 */
const toAbsoluteHttpUrl = (value: string): string | null => {
  try {
    const resolved = new URL(value);
    return resolved.protocol === 'http:' || resolved.protocol === 'https:' ? resolved.href : null;
  } catch {
    return null;
  }
};

export const resolveShareTarget = (shareUrl?: string | null): ShareTarget => {
  if (shareUrl === undefined) {
    return { kind: 'current-page' };
  }

  const candidate = shareUrl?.trim() ?? '';
  // Rejected before anything else: resolved against the site base URL this
  // would become an absolute URL on another host.
  if (candidate.startsWith('//')) {
    return { kind: 'hidden' };
  }

  if (/^https?:\/\//i.test(candidate)) {
    const absolute = toAbsoluteHttpUrl(candidate);
    return absolute ? { kind: 'url', href: absolute } : { kind: 'hidden' };
  }

  // Only site-relative shapes resolve; free text is not a route.
  if (!/^(\/|\.\/|\.\.\/)/.test(candidate)) {
    return { kind: 'hidden' };
  }

  try {
    const relative = toAbsoluteHttpUrl(new URL(candidate, getSiteConfig().baseUrl).href);
    return relative ? { kind: 'url', href: relative } : { kind: 'hidden' };
  } catch {
    return { kind: 'hidden' };
  }
};

/**
 * The href to share, read fresh on every call so a hash-syncing host is
 * reflected, and validated again here so a hand-built target cannot smuggle in
 * an unusable href. Null hides sharing: a hidden target, no location, a
 * non-http(s) location and an empty location are all unusable.
 */
const resolveHref = (target: ShareTarget): string | null => {
  if (target.kind === 'url') {
    return toAbsoluteHttpUrl(target.href);
  }

  if (target.kind === 'current-page') {
    return toAbsoluteHttpUrl(typeof window === 'undefined' ? '' : window.location.href);
  }

  return null;
};

/**
 * Builds the share controls in the canonical order: X/Twitter, Facebook,
 * email. Copy callbacks are only invoked when there is something to share.
 */
export const getShareLinks = (copy: ShareCopy, target: ShareTarget): ShareLinksResult => {
  const href = resolveHref(target);
  if (!href) {
    return { links: [], target: null };
  }

  const links: ShareLink[] = [
    {
      id: 'twitter',
      destination: twitterDestination(copy.twitterText(href)),
      icon: BsTwitterXIcon,
      screenReaderText: copy.twitterLabel,
    },
    {
      id: 'facebook',
      destination: facebookDestination(href),
      icon: BsFacebookIcon,
      screenReaderText: copy.facebookLabel,
    },
    {
      id: 'email',
      destination: emailDestination(copy.emailSubject, copy.emailBody(href)),
      icon: EmailIcon,
      screenReaderText: copy.emailLabel,
    },
  ];

  return { links, target: href };
};
