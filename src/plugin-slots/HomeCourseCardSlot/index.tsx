import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { CourseCard } from '@src/generic';
import type { CourseCardProps } from '@src/generic/course-card/types';

// TODO: Resolve the issue with the pluginProps.
// https://github.com/openedx/frontend-app-catalog/pull/18#pullrequestreview-3212047271
const HomeCourseCardSlot = ({ original: courseData, isLoading }: CourseCardProps) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.home_page.course_card"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{ isLoading }}
  >
    <CourseCard original={courseData} isLoading={isLoading} />
  </PluginSlot>
);

export default HomeCourseCardSlot;
