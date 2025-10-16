import { getConfig } from '@edx/frontend-platform';

import {
  resolveUrl, baseAppUrl, programsUrl, getCookie,
} from './utils';

jest.mock('@edx/frontend-platform', () => ({
  getAuthenticatedUser: jest.fn(() => ({ username: 'test-user', roles: [] })),
  getConfig: jest.fn(() => ({
    LMS_BASE_URL: process.env.LMS_BASE_URL,
    LANGUAGE_PREFERENCE_COOKIE_NAME: process.env.LANGUAGE_PREFERENCE_COOKIE_NAME,
  })),
}));

describe('utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  describe('resolveUrl', () => {
    it('should return the URL as is if it is null', () => {
      expect(resolveUrl('https://example.com', null as any)).toBeNull();
    });

    it('should return the URL as is if it starts with http://', () => {
      const url = 'http://example.com/path';
      expect(resolveUrl('https://base.com', url)).toBe(url);
    });

    it('should return the URL as is if it starts with https://', () => {
      const url = 'https://example.com/path';
      expect(resolveUrl('https://base.com', url)).toBe(url);
    });

    it('should combine base URL with relative URL', () => {
      const base = 'https://base.com';
      const relativeUrl = '/path/to/resource';
      expect(resolveUrl(base, relativeUrl)).toBe(`${base}${relativeUrl}`);
    });

    it('should handle empty string URL', () => {
      const base = 'https://base.com';
      expect(resolveUrl(base, '')).toBe(base);
    });
  });

  describe('baseAppUrl', () => {
    it('should combine LMS_BASE_URL with the provided URL', () => {
      const path = '/dashboard';

      expect(baseAppUrl(path)).toBe(`${getConfig().LMS_BASE_URL}${path}`);
    });

    it('should handle empty path', () => {
      expect(baseAppUrl('')).toBe(`${getConfig().LMS_BASE_URL}`);
    });
  });

  describe('programsUrl', () => {
    it('should return the programs dashboard URL', () => {
      expect(programsUrl()).toBe(`${getConfig().LMS_BASE_URL}/dashboard/programs`);
    });
  });

  describe('getCookie', () => {
    it('should return null when document.cookie is empty', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });

      expect(getCookie('testCookie')).toBeNull();
    });

    it('should return null when document.cookie is undefined', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: undefined,
      });

      expect(getCookie('testCookie')).toBeNull();
    });

    it('should return the cookie value when found', () => {
      const cookieValue = 'testValue';
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: `testCookie=${cookieValue}; otherCookie=otherValue`,
      });

      expect(getCookie('testCookie')).toBe(cookieValue);
    });

    it('should decode URI component in cookie value', () => {
      const encodedValue = 'test%20value%20with%20spaces';
      const decodedValue = 'test value with spaces';
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: `testCookie=${encodedValue}`,
      });

      expect(getCookie('testCookie')).toBe(decodedValue);
    });

    it('should return null when cookie is not found', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'otherCookie=otherValue; anotherCookie=anotherValue',
      });

      expect(getCookie('testCookie')).toBeNull();
    });

    it('should handle multiple cookies and find the correct one', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'firstCookie=firstValue; testCookie=testValue; lastCookie=lastValue',
      });

      expect(getCookie('testCookie')).toBe('testValue');
    });
  });
});
