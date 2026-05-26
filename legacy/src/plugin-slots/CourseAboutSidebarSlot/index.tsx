import { PluginSlot } from '@openedx/frontend-plugin-framework';

import CourseSidebar from '@src/course-about/course-sidebar/CourseSidebar';
import type { CourseAboutData } from '@src/course-about/types';

const CourseAboutSidebarSlot = ({ courseAboutData }: { courseAboutData: CourseAboutData }) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_about_page.sidebar"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{ courseAboutData }}
  >
    <aside>
      <CourseSidebar courseAboutData={courseAboutData} />
    </aside>
  </PluginSlot>
);

export default CourseAboutSidebarSlot;
