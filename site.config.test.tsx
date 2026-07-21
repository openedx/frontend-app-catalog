import type { SiteConfig } from '@openedx/frontend-base';

import { appId } from './src/constants';

const siteConfig: SiteConfig = {
  siteId: 'catalog-test-site',
  siteName: 'Catalog Test Site',
  baseUrl: 'http://localhost:1998',
  lmsBaseUrl: 'http://localhost:8000',
  cmsBaseUrl: 'http://localhost:8001',
  loginUrl: 'http://localhost:8000/login',
  logoutUrl: 'http://localhost:8000/logout',

  // Use 'test' instead of EnvironmentTypes.TEST to break a circular dependency
  // when mocking `@openedx/frontend-base` itself.
  environment: 'test' as SiteConfig['environment'],
  apps: [{
    appId,
    config: {
      COURSE_ABOUT_TWITTER_ACCOUNT: '@example',
      ENABLE_COURSE_DISCOVERY: true,
      ENABLE_PROGRAMS: true,
      HOMEPAGE_COURSE_MAX: 9,
      HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: 'test-youtube-id',
      INFO_EMAIL: 'support@example.com',
      LEARNING_BASE_URL: 'http://localhost:2000',
      SUPPORT_URL: 'https://support.example.com',
    },
  }],

  accessTokenCookieName: 'edx-jwt-cookie-header-payload',
  segmentKey: '',
};

export default siteConfig;
