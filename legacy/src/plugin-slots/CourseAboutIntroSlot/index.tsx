import { PluginSlot } from '@openedx/frontend-plugin-framework';
import type { CourseAboutDataPartial } from '@src/course-about/types';
import { CourseIntro } from '@src/course-about/course-intro/CourseIntro';

const CourseAboutIntroSlot = ({ courseAboutData }: { courseAboutData: CourseAboutDataPartial }) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_about_page.intro"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{ courseAboutData }}
  >
    <CourseIntro courseAboutData={courseAboutData} />
  </PluginSlot>
);

export default CourseAboutIntroSlot;
