import { PluginSlot } from '@openedx/frontend-plugin-framework';

import CourseMedia from '@src/course-about/course-intro/course-media/CourseMedia';
import type { CourseAboutCourseMediaSlotProps } from './types';

const CourseAboutCourseMediaSlot = ({ courseAboutData }: CourseAboutCourseMediaSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_about_page.course_media"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{ courseAboutData }}
  >
    <CourseMedia courseAboutData={courseAboutData} />
  </PluginSlot>
);

export default CourseAboutCourseMediaSlot;
