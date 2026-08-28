import { App } from '@openedx/frontend-base';
import { appId } from '@src/constants';
import routes from '@src/routes';
import slots from '@src/slots';

const app: App = {
  appId,
  routes,
  slots,
  defaultConfig: {
    HOMEPAGE_COURSE_MAX: 9,
  },
};

export default app;
