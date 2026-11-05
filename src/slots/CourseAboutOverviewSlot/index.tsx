import { Slot } from '@openedx/frontend-base';

import { CourseOverview } from '@src/course-about/course-overview';

export interface CourseAboutOverviewSlotProps {
  overviewData: string;
  courseId: string;
  hideActions?: boolean;
}

const CourseAboutOverviewSlot = ({ overviewData, courseId, hideActions = false }: CourseAboutOverviewSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutOverview.v1"
    overviewData={overviewData}
    courseId={courseId}
    hideActions={hideActions}
  >
    <CourseOverview overviewData={overviewData} courseId={courseId} hideActions={hideActions} />
  </Slot>
);

export default CourseAboutOverviewSlot;
