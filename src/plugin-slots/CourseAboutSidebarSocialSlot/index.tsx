import { PluginSlot } from '@openedx/frontend-plugin-framework';

import type { CourseAboutData } from '@src/course-about/types';
import SidebarSocial from '@src/course-about/course-sidebar/sidebar-social/SidebarSocial';

const CourseAboutSidebarSocialSlot = ({ courseAboutData }: { courseAboutData: CourseAboutData }) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_about_page.sidebar.social"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{ courseAboutData }}
  >
    <SidebarSocial courseAboutData={courseAboutData} />
  </PluginSlot>
);

export default CourseAboutSidebarSocialSlot;
