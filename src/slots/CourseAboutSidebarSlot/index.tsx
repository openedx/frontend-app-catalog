import { Slot } from '@openedx/frontend-base';

import CourseSidebar from '@src/course-about/course-sidebar/CourseSidebar';
import type { CourseAboutData } from '@src/course-about/types';

export interface CourseAboutSidebarSlotProps {
  courseAboutData: CourseAboutData;
}

const CourseAboutSidebarSlot = ({
  courseAboutData,
  shareUrl,
}: CourseAboutSidebarSlotProps & { shareUrl?: string | null }) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutSidebar.v1"
    courseAboutData={courseAboutData}
  >
    <aside>
      <CourseSidebar courseAboutData={courseAboutData} shareUrl={shareUrl} />
    </aside>
  </Slot>
);

export default CourseAboutSidebarSlot;
