import { getConfig } from '@edx/frontend-platform';

import { mockCourseAboutResponse } from '@src/__mocks__';
import {
  getTwitterShareUrl,
  getEmailShareUrl,
  getFacebookShareUrl,
  getSocialLinks,
} from '../utils';
import messages from '../messages';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    SITE_NAME: process.env.SITE_NAME,
    COURSE_ABOUT_TWITTER_ACCOUNT: process.env.COURSE_ABOUT_TWITTER_ACCOUNT,
  })),
}));

const mockLocation = {
  href: 'https://example.com/course/test-course',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('Social Sharing Utils', () => {
  const mockIntl = {
    formatMessage: jest.fn().mockImplementation((message, values) => {
      if (!values) {
        return message.defaultMessage;
      }

      return Object.entries(values).reduce(
        (str, [key, value]) => str.replace(`{${key}}`, value || ''),
        message.defaultMessage,
      );
    }),
  };

  const createCourseData = (overrides = {}) => ({
    ...mockCourseAboutResponse,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = mockLocation.href;
  });

  describe('getTwitterShareUrl', () => {
    it('generates correct Twitter share URL with course data', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: 'CS101',
        name: 'Introduction to Computer Science',
      });

      const result = getTwitterShareUrl(courseData, mockIntl);

      expect(result).toContain('https://twitter.com/intent/tweet?text=');
      expect(result).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
      expect(result).toContain(encodeURIComponent(courseData.name));
      expect(result).toContain(encodeURIComponent(getConfig().COURSE_ABOUT_TWITTER_ACCOUNT));
      expect(result).toContain(encodeURIComponent(mockLocation.href));
    });

    it('calls formatMessage for Twitter text with course data', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: 'CS101',
        name: 'Test Course',
      });
      getTwitterShareUrl(courseData, mockIntl);

      expect(mockIntl.formatMessage).toHaveBeenCalledWith(
        messages.socialSharingTwitterText,
        {
          courseNumber: courseData.displayNumberWithDefault,
          courseName: courseData.name,
          platformTwitter: getConfig().COURSE_ABOUT_TWITTER_ACCOUNT,
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

      const result = getEmailShareUrl(courseData, mockIntl);

      expect(result).toContain('mailto:?subject=');
      expect(result).toContain('&body=');
      expect(result).toContain(encodeURIComponent(getConfig().SITE_NAME));
      expect(result).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
      expect(result).toContain(encodeURIComponent(courseData.name));
      expect(result).toContain(encodeURIComponent(mockLocation.href));
    });

    it('calls formatMessage for email subject and body with course data', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: 'MATH201',
        name: 'Advanced Mathematics',
      });
      getEmailShareUrl(courseData, mockIntl);

      expect(mockIntl.formatMessage).toHaveBeenCalledWith(
        messages.socialSharingEmailSubject,
        { siteName: getConfig().SITE_NAME },
      );
      expect(mockIntl.formatMessage).toHaveBeenCalledWith(
        messages.socialSharingEmailBody,
        {
          courseNumber: courseData.displayNumberWithDefault,
          courseName: courseData.name,
          siteName: getConfig().SITE_NAME,
          url: window.location.href,
        },
      );
    });

    it('formats messages correctly with provided values', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: 'CS101',
        name: 'Test Course',
      });

      const twitterUrl = getTwitterShareUrl(courseData, mockIntl);
      const emailUrl = getEmailShareUrl(courseData, mockIntl);

      expect(twitterUrl).toContain(encodeURIComponent(
        messages.socialSharingTwitterText.defaultMessage
          .replace('{courseNumber}', courseData.displayNumberWithDefault)
          .replace('{courseName}', courseData.name)
          .replace('{platformTwitter}', getConfig().COURSE_ABOUT_TWITTER_ACCOUNT)
          .replace('{url}', window.location.href),
      ));
      expect(emailUrl).toContain(encodeURIComponent(
        messages.socialSharingEmailBody.defaultMessage
          .replace('{courseNumber}', courseData.displayNumberWithDefault)
          .replace('{courseName}', courseData.name)
          .replace('{siteName}', getConfig().SITE_NAME)
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
      const result = getSocialLinks(mockIntl);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('twitter');
      expect(result[1].id).toBe('facebook');
      expect(result[2].id).toBe('email');
    });

    it('includes correct icons for each social platform', () => {
      const result = getSocialLinks(mockIntl);

      expect(result[0].icon).toBeDefined();
      expect(result[1].icon).toBeDefined();
      expect(result[2].icon).toBeDefined();
    });

    it('includes screen reader text for each platform', () => {
      getSocialLinks(mockIntl);

      expect(mockIntl.formatMessage).toHaveBeenCalledWith(messages.socialSharingTwitter);
      expect(mockIntl.formatMessage).toHaveBeenCalledWith(messages.socialSharingFacebook);
      expect(mockIntl.formatMessage).toHaveBeenCalledWith(messages.socialSharingEmail);
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles undefined course data gracefully', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: undefined,
        name: undefined,
      });

      expect(() => {
        getTwitterShareUrl(courseData, mockIntl);
        getEmailShareUrl(courseData, mockIntl);
      }).not.toThrow();
    });

    it('handles empty strings in course data', () => {
      const courseData = createCourseData({
        displayNumberWithDefault: '',
        name: '',
      });

      const twitterUrl = getTwitterShareUrl(courseData, mockIntl);
      const emailUrl = getEmailShareUrl(courseData, mockIntl);

      expect(twitterUrl).toContain('https://twitter.com/intent/tweet?text=');
      expect(emailUrl).toContain('mailto:?subject=');
    });

    it('handles missing config values', () => {
      (getConfig as jest.Mock).mockReturnValue({
        SITE_NAME: undefined,
        COURSE_ABOUT_TWITTER_ACCOUNT: undefined,
      });

      const courseData = createCourseData();
      const twitterUrl = getTwitterShareUrl(courseData, mockIntl);
      const emailUrl = getEmailShareUrl(courseData, mockIntl);

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

      const twitterUrl = getTwitterShareUrl(courseData, mockIntl);
      const emailUrl = getEmailShareUrl(courseData, mockIntl);

      expect(twitterUrl).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
      expect(twitterUrl).toContain(encodeURIComponent(courseData.name));
      expect(emailUrl).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
      expect(emailUrl).toContain(encodeURIComponent(courseData.name));
    });
  });
});
