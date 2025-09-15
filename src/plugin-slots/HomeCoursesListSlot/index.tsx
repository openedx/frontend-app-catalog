import { PluginSlot } from '@openedx/frontend-plugin-framework';

import CoursesList from '@src/home/components/courses-list/CoursesList';

// TODO: Resolve the issue with the pluginProps.
// https://github.com/openedx/frontend-app-catalog/pull/18#pullrequestreview-3212047271
const HomeCoursesListSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.catalog.home_page.courses_list"
    slotOptions={{
      mergeProps: true,
    }}
  >
    <CoursesList />
  </PluginSlot>
);

export default HomeCoursesListSlot;
