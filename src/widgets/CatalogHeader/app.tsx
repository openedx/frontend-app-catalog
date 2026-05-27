import {
  App,
  WidgetOperationTypes,
  getAppConfig,
  getAuthenticatedUser,
  helpButtonSlotOperation,
} from '@openedx/frontend-base';

import { appId, catalogRole } from '../../constants';

import CoursesLinkMenuItem from './CoursesLinkMenuItem';
import ProgramsLinkMenuItem from './ProgramsLinkMenuItem';
import DiscoverLinkMenuItem from './DiscoverLinkMenuItem';
import ExploreCoursesLinkMenuItem from './ExploreCoursesLinkMenuItem';

const app: App = {
  appId: 'org.openedx.frontend.app.catalog.header',
  slots: [
    {
      slotId: 'org.openedx.frontend.slot.header.primaryLinks.v1',
      id: 'org.openedx.frontend.widget.catalog.headerLinkCourses.v1',
      op: WidgetOperationTypes.APPEND,
      element: <CoursesLinkMenuItem variant="navLink" />,
      condition: {
        active: [catalogRole],
        callback: () => !!getAuthenticatedUser(),
      },
    },
    {
      slotId: 'org.openedx.frontend.slot.header.primaryLinks.v1',
      id: 'org.openedx.frontend.widget.catalog.headerLinkPrograms.v1',
      op: WidgetOperationTypes.APPEND,
      element: <ProgramsLinkMenuItem variant="navLink" />,
      condition: {
        active: [catalogRole],
        callback: () => !!getAuthenticatedUser() && getAppConfig(appId).ENABLE_PROGRAMS === true,
      },
    },
    {
      slotId: 'org.openedx.frontend.slot.header.primaryLinks.v1',
      id: 'org.openedx.frontend.widget.catalog.headerLinkDiscover.v1',
      op: WidgetOperationTypes.APPEND,
      element: <DiscoverLinkMenuItem variant="navLink" />,
      condition: {
        active: [catalogRole],
        callback: () => !!getAuthenticatedUser() && getAppConfig(appId).NON_BROWSABLE_COURSES !== true,
      },
    },
    {
      slotId: 'org.openedx.frontend.slot.header.primaryLinks.v1',
      id: 'org.openedx.frontend.widget.catalog.headerLinkExploreCourses.v1',
      op: WidgetOperationTypes.APPEND,
      element: <ExploreCoursesLinkMenuItem variant="navLink" />,
      condition: {
        active: [catalogRole],
        callback: () => !getAuthenticatedUser() && getAppConfig(appId).ENABLE_COURSE_DISCOVERY === true,
      },
    },
    helpButtonSlotOperation({ appId, role: catalogRole }),
  ],
};

export default app;
