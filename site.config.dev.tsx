import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';

import { catalogApp } from './src';

import '@openedx/frontend-base/shell/style';

const siteConfig: SiteConfig = {
  siteId: 'catalog-dev',
  siteName: 'Catalog Dev',
  baseUrl: 'http://apps.local.openedx.io:1998',
  lmsBaseUrl: 'http://local.openedx.io:8000',
  cmsBaseUrl: 'http://studio.local.openedx.io:8001',
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
        ENABLE_COURSE_DISCOVERY: true,
        ENABLE_COURSE_SORTING_BY_START_DATE: true,
        INFO_EMAIL: 'support@example.com',
      },
    },
  ],

  externalRoutes: [
    {
      role: 'org.openedx.frontend.role.home',
      url: 'http://local.openedx.io:8000/dashboard',
    },
    {
      role: 'org.openedx.frontend.role.profile',
      url: 'http://apps.local.openedx.io:1995/profile/',
    },
    {
      role: 'org.openedx.frontend.role.account',
      url: 'http://apps.local.openedx.io:1997/account/',
    },
    {
      role: 'org.openedx.frontend.role.logout',
      url: 'http://local.openedx.io:8000/logout',
    },
  ],

  accessTokenCookieName: 'edx-jwt-cookie-header-payload',
};

export default siteConfig;
