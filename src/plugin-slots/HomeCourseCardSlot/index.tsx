import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { CourseCard } from '@src/generic';
import { CourseCardProps } from '@src/generic/course-card/types';

const HomeCourseCardSlot = ({ course }: CourseCardProps) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.home_page.course_card"
    slotOptions={{
      mergeProps: true,
    }}
  >
    <CourseCard course={course} />
  </PluginSlot>
);

export default HomeCourseCardSlot;
