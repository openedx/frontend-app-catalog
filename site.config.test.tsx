import { EnvironmentTypes, SiteConfig } from '@openedx/frontend-base';

const siteConfig: SiteConfig = {
  siteId: 'catalog-test-site',
  siteName: 'Catalog Test Site',
  baseUrl: 'http://localhost:1998',
  lmsBaseUrl: 'http://localhost:8000',
  loginUrl: 'http://localhost:8000/login',
  logoutUrl: 'http://localhost:8000/logout',

  environment: EnvironmentTypes?.TEST ?? 'test',
  apps: [{
    appId: 'org.openedx.frontend.app.catalog',
    config: {},
  }],
};

export default siteConfig;
