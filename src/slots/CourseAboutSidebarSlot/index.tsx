import { Slot } from '@openedx/frontend-base';

import CourseSidebar from '@src/course-about/course-sidebar/CourseSidebar';
import type { CourseAboutData } from '@src/course-about/types';
import type { ShareTarget } from '@src/generic/share-links';

export interface CourseAboutSidebarSlotProps {
  courseAboutData: CourseAboutData;
  /** Share policy for this render, forwarded so customizers can honour it. */
  shareTarget?: ShareTarget;
}

const CURRENT_PAGE: ShareTarget = { kind: 'current-page' };

const CourseAboutSidebarSlot = ({
  courseAboutData,
  shareTarget = CURRENT_PAGE,
}: CourseAboutSidebarSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutSidebar.v1"
    courseAboutData={courseAboutData}
    shareTarget={shareTarget}
  >
    <aside>
      <CourseSidebar courseAboutData={courseAboutData} shareTarget={shareTarget} />
    </aside>
  </Slot>
);

export default CourseAboutSidebarSlot;
