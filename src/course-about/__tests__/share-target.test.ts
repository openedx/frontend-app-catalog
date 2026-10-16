import { getSiteConfig } from '@openedx/frontend-base';

import { resolveShareTarget } from '../share-target';

describe('resolveShareTarget', () => {
  it('defers an omitted target to the live location', () => {
    // No URL is captured, so the destination is built from the location at
    // render time rather than from a stale href.
    window.history.replaceState(null, '', '/catalog/courses/course-1/about');

    expect(resolveShareTarget()).toEqual({ kind: 'current-page' });
    expect(resolveShareTarget(undefined)).toEqual({ kind: 'current-page' });
  });

  it('accepts an absolute http(s) URL', () => {
    expect(resolveShareTarget('https://example.com/courses/1/about')).toEqual({
      kind: 'url',
      href: 'https://example.com/courses/1/about',
    });
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
    ['a non-http scheme', 'javascript:alert(1)'],
    ['a malformed absolute URL', 'http://[bad'],
  ])('hides sharing for %s', (_label, value) => {
    expect(resolveShareTarget(value)).toEqual({ kind: 'hidden' });
  });
});
