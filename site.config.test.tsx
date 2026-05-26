import { EnvironmentTypes, SiteConfig } from '@openedx/frontend-base';

import { appId } from './src/constants';

const siteConfig: SiteConfig = {
  siteId: 'catalog-test-site',
  siteName: 'Catalog Test Site',
  baseUrl: 'http://localhost:1998',
  lmsBaseUrl: 'http://localhost:8000',
  loginUrl: 'http://localhost:8000/login',
  logoutUrl: 'http://localhost:8000/logout',

  environment: EnvironmentTypes?.TEST ?? 'test',
  apps: [{
    appId,
    config: {
      ENABLE_COURSE_DISCOVERY: true,
      HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: 'test-youtube-id',
      HOMEPAGE_COURSE_MAX: 9,
      INFO_EMAIL: 'support@example.com',
    },
  }],
};

export default siteConfig;
