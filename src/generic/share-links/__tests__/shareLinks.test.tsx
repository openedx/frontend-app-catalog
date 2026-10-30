import { render, screen, within } from '@testing-library/react';
import { IntlProvider, getSiteConfig } from '@openedx/frontend-base';
import {
  BsFacebook as BsFacebookIcon,
  BsTwitterX as BsTwitterXIcon,
  Email as EmailIcon,
} from '@openedx/paragon/icons';

import { ShareLinks, getShareLinks, resolveShareTarget } from '..';
import type { ShareCopy } from '..';

/** Paragon's link and icon read intl; the Module's own functions do not. */
const renderLinks = (links: Parameters<typeof ShareLinks>[0]['links']) => render(
  <IntlProvider locale="en"><ShareLinks links={links} /></IntlProvider>,
);

const makeCopy = (overrides: Partial<ShareCopy> = {}): ShareCopy => ({
  twitterLabel: 'Tweet that you enrolled',
  facebookLabel: 'Post a Facebook message',
  emailLabel: 'Email someone',
  twitterText: jest.fn((url: string) => `Look at this course ${url} now!`),
  emailSubject: 'A course for you',
  emailBody: jest.fn((url: string) => `I enrolled, see ${url}`),
  ...overrides,
});

describe('share-links', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/catalog/courses/course-1/about');
  });

  describe('getShareLinks', () => {
    it('builds the three links in canonical order with stable ids and icons', () => {
      const copy = makeCopy();

      const { links } = getShareLinks(copy, { kind: 'current-page' });

      expect(links.map((link) => link.id)).toEqual(['twitter', 'facebook', 'email']);
      expect(links.map((link) => link.icon)).toEqual([BsTwitterXIcon, BsFacebookIcon, EmailIcon]);
      expect(links.map((link) => link.screenReaderText)).toEqual([
        copy.twitterLabel, copy.facebookLabel, copy.emailLabel,
      ]);
    });

    it('encodes each interpolated value exactly once', () => {
      const href = 'https://example.com/courses/1/about?a=1&b=2';
      const copy = makeCopy({ emailSubject: 'Subject & more' });

      const { links } = getShareLinks(copy, { kind: 'url', href });
      const [twitter, facebook, email] = links;

      expect(twitter.destination).toBe(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Look at this course ${href} now!`)}`,
      );
      expect(facebook.destination).toBe(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(href)}`,
      );
      expect(email.destination).toBe(
        `mailto:?subject=${encodeURIComponent('Subject & more')}&body=${encodeURIComponent(`I enrolled, see ${href}`)}`,
      );

      // Decoding returns the original copy, so nothing was encoded twice.
      expect(new URL(twitter.destination).searchParams.get('text')).toBe(`Look at this course ${href} now!`);
      expect(new URL(facebook.destination).searchParams.get('u')).toBe(href);
      expect(new URL(email.destination).searchParams.get('subject')).toBe('Subject & more');
      expect(new URL(email.destination).searchParams.get('body')).toBe(`I enrolled, see ${href}`);
    });

    it('passes the same resolved url to both copy callbacks and to Facebook', () => {
      const href = 'https://example.com/courses/1/about';
      const copy = makeCopy();

      const { links, target } = getShareLinks(copy, { kind: 'url', href });

      expect(target).toBe(href);
      expect(copy.twitterText).toHaveBeenCalledWith(href);
      expect(copy.emailBody).toHaveBeenCalledWith(href);
      expect(new URL(links[1].destination).searchParams.get('u')).toBe(href);
    });

    it('reads the current page fresh on every call, including the hash', () => {
      const copy = makeCopy();

      const first = getShareLinks(copy, { kind: 'current-page' });
      expect(first.target).toBe(window.location.href);

      window.history.replaceState(null, '', '/catalog/courses/course-1/about#credentials');
      const second = getShareLinks(copy, { kind: 'current-page' });

      expect(second.target).toBe(window.location.href);
      expect(second.target).toContain('#credentials');
      expect(second.target).not.toBe(first.target);
      expect(new URL(second.links[1].destination).searchParams.get('u')).toBe(second.target);
      expect(new URL(second.links[0].destination).searchParams.get('text')).toContain('#credentials');
    });

    it('hides sharing without invoking any copy callback', () => {
      const copy = makeCopy();

      expect(getShareLinks(copy, { kind: 'hidden' })).toEqual({ links: [], target: null });
      expect(copy.twitterText).not.toHaveBeenCalled();
      expect(copy.emailBody).not.toHaveBeenCalled();
    });

    it('hides a hand-built union href that is not an absolute http(s) URL', () => {
      const copy = makeCopy();
      const unusable = [
        'javascript:alert(1)',
        'data:text/html,<b>x</b>',
        'ftp://example.com/x',
        'http://[bad',
        '/catalog/courses/1/about',
      ];

      unusable.forEach((href) => {
        expect(getShareLinks(copy, { kind: 'url', href })).toEqual({ links: [], target: null });
      });

      // Validation happens before any copy is composed.
      expect(copy.twitterText).not.toHaveBeenCalled();
      expect(copy.emailBody).not.toHaveBeenCalled();
    });

    it('hides sharing when the live location is not http(s)', () => {
      const copy = makeCopy();
      const descriptor = Object.getOwnPropertyDescriptor(window, 'location');
      Object.defineProperty(window, 'location', { value: { href: 'ftp://example.com/x' }, configurable: true });

      try {
        expect(getShareLinks(copy, { kind: 'current-page' })).toEqual({ links: [], target: null });
      } finally {
        if (descriptor) {
          Object.defineProperty(window, 'location', descriptor);
        }
      }
    });

    it('hides sharing when there is no location', () => {
      const copy = makeCopy();
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
      Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });

      try {
        expect(getShareLinks(copy, { kind: 'current-page' })).toEqual({ links: [], target: null });
      } finally {
        if (descriptor) {
          Object.defineProperty(globalThis, 'window', descriptor);
        }
      }
    });
  });

  describe('resolveShareTarget', () => {
    it('treats an omitted target as the current page', () => {
      expect(resolveShareTarget()).toEqual({ kind: 'current-page' });
      expect(resolveShareTarget(undefined)).toEqual({ kind: 'current-page' });
    });

    it('accepts an absolute http(s) URL', () => {
      expect(resolveShareTarget('https://example.com/courses/1/about'))
        .toEqual({ kind: 'url', href: 'https://example.com/courses/1/about' });
    });

    it('keeps a fully-qualified external http(s) URL', () => {
      expect(resolveShareTarget('https://other.example/courses/1'))
        .toEqual({ kind: 'url', href: 'https://other.example/courses/1' });
    });

    it('resolves a site-root-relative path against the site base URL', () => {
      expect(resolveShareTarget('/catalog/courses/1/about')).toEqual({
        kind: 'url',
        href: new URL('/catalog/courses/1/about', getSiteConfig().baseUrl).href,
      });
    });

    it.each([
      ['null', null],
      ['an empty string', ''],
      ['blank text', '   '],
      ['a bare hash', '#'],
      ['free text', 'garbage'],
      ['a javascript URL', 'javascript:alert(1)'],
      ['a data URL', 'data:text/html,<b>x</b>'],
      ['a non-http scheme', 'ftp://example.com/x'],
      ['a malformed absolute URL', 'http://[bad'],
      ['a protocol-relative URL', '//other.example/courses/1'],
    ])('hides sharing for %s', (_label, value) => {
      expect(resolveShareTarget(value)).toEqual({ kind: 'hidden' });
    });
  });

  describe('ShareLinks', () => {
    it('renders one labelled link per share control', () => {
      const copy = makeCopy();
      const { links } = getShareLinks(copy, { kind: 'url', href: 'https://example.com/x' });

      renderLinks(links);

      const anchors = screen.getAllByRole('link');
      expect(anchors).toHaveLength(3);
      expect(within(anchors[0]).getByText(copy.twitterLabel)).toBeInTheDocument();
      expect(within(anchors[1]).getByText(copy.facebookLabel)).toBeInTheDocument();
      expect(within(anchors[2]).getByText(copy.emailLabel)).toBeInTheDocument();
      expect(anchors[0]).toHaveAttribute('href', links[0].destination);
      expect(anchors[1]).toHaveAttribute('href', links[1].destination);
      expect(anchors[2]).toHaveAttribute('href', links[2].destination);
    });

    it('renders nothing when there is nothing to share', () => {
      const { links } = getShareLinks(makeCopy(), { kind: 'hidden' });

      const { container } = render(
        <IntlProvider locale="en"><ShareLinks links={links} /></IntlProvider>,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
