import { PluginSlot } from '@openedx/frontend-plugin-framework';

import CoursesList from '@src/home/components/courses-list/CoursesList';

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
