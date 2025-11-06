import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { CourseOverview } from '@src/course-about/course-overview';
import type { CourseOverviewProps } from '@src/course-about/course-overview/types';

const CourseAboutOverviewSlot = ({ overviewData, courseId }: CourseOverviewProps) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_about_page.overview"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{ overviewData, courseId }}
  >
    <CourseOverview overviewData={overviewData} courseId={courseId} />
  </PluginSlot>
);

export default CourseAboutOverviewSlot;
