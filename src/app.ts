import { App } from '@openedx/frontend-base';
import { appId } from '@src/constants';
import routes from '@src/routes';
import slots from '@src/slots';

const app: App = {
  appId,
  routes,
  slots,
  config: {
    ENABLE_COURSE_DISCOVERY: false,
    ENABLE_PROGRAMS: false,
    HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: '',
    HOMEPAGE_COURSE_MAX: 9,
    ENABLE_COURSE_SORTING_BY_START_DATE: false,
    NON_BROWSABLE_COURSES: '',
    INFO_EMAIL: '',
    SUPPORT_URL: '',
  },
};

export default app;
