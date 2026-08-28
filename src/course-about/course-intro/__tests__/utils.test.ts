import { getAppConfig } from '@openedx/frontend-base';

import { getLearningHomePageUrl } from '../utils';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAppConfig: jest.fn(),
}));

const mockedGetAppConfig = getAppConfig as jest.Mock;

describe('getLearningHomePageUrl', () => {
  it('builds the course home URL from LEARNING_BASE_URL', () => {
    mockedGetAppConfig.mockReturnValue({ LEARNING_BASE_URL: 'http://localhost:2000' });

    expect(getLearningHomePageUrl('course-v1:edX+DemoX+Demo')).toBe(
      'http://localhost:2000/course/course-v1:edX+DemoX+Demo/home',
    );
  });

  it.each([
    ['unset', undefined],
    ['an empty string', ''],
    ['not a string', 2000],
  ])('returns null when LEARNING_BASE_URL is %s', (_, learningBaseUrl) => {
    mockedGetAppConfig.mockReturnValue({ LEARNING_BASE_URL: learningBaseUrl });

    expect(getLearningHomePageUrl('course-v1:edX+DemoX+Demo')).toBeNull();
  });
});
