import { Slot } from '@openedx/frontend-base';

import { CourseOverview } from '@src/course-about/course-overview';

export interface CourseAboutOverviewSlotProps {
  overviewData: string;
  courseId: string;
}

const CourseAboutOverviewSlot = ({ overviewData, courseId }: CourseAboutOverviewSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutOverview.v1"
    overviewData={overviewData}
    courseId={courseId}
  >
    <CourseOverview overviewData={overviewData} courseId={courseId} />
  </Slot>
);

export default CourseAboutOverviewSlot;
