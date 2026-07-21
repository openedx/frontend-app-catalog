import { createElement, type ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import {
  IntlProvider, getAppConfig, getSiteConfig, useIntl,
} from '@openedx/frontend-base';

import { appId } from '@src/constants';
import { mockCourseAboutResponse } from '@src/__mocks__';
import {
  getEmailShareUrl,
  getFacebookShareUrl,
  getSocialLinks,
  getTwitterShareUrl,
} from '../utils';
import messages from '../messages';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getSiteConfig: jest.fn(),
  getAppConfig: jest.fn(),
}));

const {
  getSiteConfig: actualGetSiteConfig,
  getAppConfig: actualGetAppConfig,
} = jest.requireActual('@openedx/frontend-base');
const mockedGetSiteConfig = getSiteConfig as jest.Mock;
const mockedGetAppConfig = getAppConfig as jest.Mock;

const mockLocation = {
  href: 'https://example.com/course/test-course',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('Social Sharing Utils', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    createElement(IntlProvider, { locale: 'en', messages: {} }, children)
  );
  const intl = renderHook(() => useIntl(), { wrapper }).result.current;
  let formatMessageSpy: jest.SpyInstance;

  const createCourseData = (overrides = {}) => ({
    ...mockCourseAboutResponse,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetSiteConfig.mockImplementation(actualGetSiteConfig);
    mockedGetAppConfig.mockImplementation(actualGetAppConfig);
    formatMessageSpy = jest.spyOn(intl, 'formatMessage');
    window.location.href = mockLocation.href;
  });

  describe('getTwitterShareUrl', () => {
    it('generates correct Twitter share URL with course data', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: 'CS101',
        name: 'Introduction to Computer Science',
      });

      const result = getTwitterShareUrl(courseData, intl);

      expect(result).toContain('https://twitter.com/intent/tweet?text=');
      expect(result).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
      expect(result).toContain(encodeURIComponent(courseData.name));
      expect(result).toContain(encodeURIComponent(getAppConfig(appId).COURSE_ABOUT_TWITTER_ACCOUNT as string));
      expect(result).toContain(encodeURIComponent(mockLocation.href));
    });

    it('calls formatMessage for Twitter text with course data', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: 'CS101',
        name: 'Test Course',
      });
      getTwitterShareUrl(courseData, intl);

      expect(formatMessageSpy).toHaveBeenCalledWith(
        messages.socialSharingTwitterText,
        {
          courseNumber: courseData.displayNumberWithDefault,
          courseName: courseData.name,
          platformTwitter: getAppConfig(appId).COURSE_ABOUT_TWITTER_ACCOUNT,
          url: window.location.href,
        },
      );
    });
  });

  describe('getEmailShareUrl', () => {
    it('generates correct email share URL with course data', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: 'MATH201',
        name: 'Advanced Mathematics',
      });

      const result = getEmailShareUrl(courseData, intl);

      expect(result).toContain('mailto:?subject=');
      expect(result).toContain('&body=');
      expect(result).toContain(encodeURIComponent(getSiteConfig().siteName));
      expect(result).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
      expect(result).toContain(encodeURIComponent(courseData.name));
      expect(result).toContain(encodeURIComponent(mockLocation.href));
    });

    it('calls formatMessage for email subject and body with course data', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: 'MATH201',
        name: 'Advanced Mathematics',
      });
      getEmailShareUrl(courseData, intl);

      expect(formatMessageSpy).toHaveBeenCalledWith(
        messages.socialSharingEmailSubject,
        { siteName: getSiteConfig().siteName },
      );
      expect(formatMessageSpy).toHaveBeenCalledWith(
        messages.socialSharingEmailBody,
        {
          courseNumber: courseData.displayNumberWithDefault,
          courseName: courseData.name,
          siteName: getSiteConfig().siteName,
          url: window.location.href,
        },
      );
    });

    it('formats messages correctly with provided values', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: 'CS101',
        name: 'Test Course',
      });

      const twitterUrl = getTwitterShareUrl(courseData, intl);
      const emailUrl = getEmailShareUrl(courseData, intl);

      expect(twitterUrl).toContain(encodeURIComponent(
        messages.socialSharingTwitterText.defaultMessage
          .replace('{courseNumber}', courseData.displayNumberWithDefault)
          .replace('{courseName}', courseData.name)
          .replace('{platformTwitter}', getAppConfig(appId).COURSE_ABOUT_TWITTER_ACCOUNT as string)
          .replace('{url}', window.location.href),
      ));
      expect(emailUrl).toContain(encodeURIComponent(
        messages.socialSharingEmailBody.defaultMessage
          .replace('{courseNumber}', courseData.displayNumberWithDefault)
          .replace('{courseName}', courseData.name)
          .replace('{siteName}', getSiteConfig().siteName)
          .replace('{url}', window.location.href),
      ));
    });
  });

  describe('getFacebookShareUrl', () => {
    it('generates correct Facebook share URL', () => {
      const result = getFacebookShareUrl();

      expect(result).toContain('https://www.facebook.com/sharer/sharer.php?u=');
      expect(result).toContain(encodeURIComponent(mockLocation.href));
    });

    it('handles empty window.location.href', () => {
      window.location.href = '';

      const result = getFacebookShareUrl();

      expect(result).toBe('#');
    });
  });

  describe('getSocialLinks', () => {
    it('returns array of social link configurations', () => {
      const result = getSocialLinks(intl);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('twitter');
      expect(result[1].id).toBe('facebook');
      expect(result[2].id).toBe('email');
    });

    it('includes correct icons for each social platform', () => {
      const result = getSocialLinks(intl);

      expect(result[0].icon).toBeDefined();
      expect(result[1].icon).toBeDefined();
      expect(result[2].icon).toBeDefined();
    });

    it('includes screen reader text for each platform', () => {
      getSocialLinks(intl);

      expect(formatMessageSpy).toHaveBeenCalledWith(messages.socialSharingTwitter);
      expect(formatMessageSpy).toHaveBeenCalledWith(messages.socialSharingFacebook);
      expect(formatMessageSpy).toHaveBeenCalledWith(messages.socialSharingEmail);
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles undefined course data gracefully', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: undefined,
        name: undefined,
      });

      expect(() => {
        getTwitterShareUrl(courseData, intl);
        getEmailShareUrl(courseData, intl);
      }).not.toThrow();
    });

    it('handles empty strings in course data', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: '',
        name: '',
      });

      const twitterUrl = getTwitterShareUrl(courseData, intl);
      const emailUrl = getEmailShareUrl(courseData, intl);

      expect(twitterUrl).toContain('https://twitter.com/intent/tweet?text=');
      expect(emailUrl).toContain('mailto:?subject=');
    });

    it('handles missing config values', () => {
      mockedGetSiteConfig.mockReturnValue({ siteName: undefined });
      mockedGetAppConfig.mockReturnValue({ COURSE_ABOUT_TWITTER_ACCOUNT: undefined });

      const courseData = createCourseData();
      const twitterUrl = getTwitterShareUrl(courseData, intl);
      const emailUrl = getEmailShareUrl(courseData, intl);

      expect(twitterUrl).toContain('https://twitter.com/intent/tweet?text=');
      expect(emailUrl).toContain('mailto:?subject=');
    });
  });

  describe('URL encoding', () => {
    it('properly encodes special characters in URLs', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: 'CS-101 & 102',
        name: 'Programming & Algorithms: "Advanced" Topics',
      });

      const twitterUrl = getTwitterShareUrl(courseData, intl);
      const emailUrl = getEmailShareUrl(courseData, intl);

      expect(twitterUrl).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
      expect(twitterUrl).toContain(encodeURIComponent(courseData.name));
      expect(emailUrl).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
      expect(emailUrl).toContain(encodeURIComponent(courseData.name));
    });
  });
});
