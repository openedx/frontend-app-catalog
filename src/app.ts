import { App } from '@openedx/frontend-base';
import { appId } from '@src/constants';
import routes from '@src/routes';
import slots from '@src/slots';
import { DEFAULT_COURSES_COUNT } from '@src/home/constants';

const app: App = {
  appId,
  routes,
  slots,
  defaultConfig: {
    HOMEPAGE_COURSE_MAX: DEFAULT_COURSES_COUNT,
  },
};

export default app;
