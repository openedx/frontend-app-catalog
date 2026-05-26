import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';

import { catalogApp } from './src';

import '@openedx/frontend-base/shell/style';

const siteConfig: SiteConfig = {
  siteId: 'catalog-dev',
  siteName: 'Catalog Dev',
  baseUrl: 'http://apps.local.openedx.io:1998',
  lmsBaseUrl: 'http://local.openedx.io:8000',
  loginUrl: 'http://local.openedx.io:8000/login',
  logoutUrl: 'http://local.openedx.io:8000/logout',

  environment: EnvironmentTypes.DEVELOPMENT,
  apps: [
    shellApp,
    headerApp,
    footerApp,
    {
      ...catalogApp,
      config: {
        ...catalogApp.config,
        ENABLE_COURSE_DISCOVERY: true,
        HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: 'test-youtube-id',
        INFO_EMAIL: 'support@example.com',
      },
    },
  ],

  accessTokenCookieName: 'edx-jwt-cookie-header-payload',
  runtimeConfigJsonUrl: 'http://local.openedx.io:8000/api/frontend_site_config/v1/',
};

export default siteConfig;
