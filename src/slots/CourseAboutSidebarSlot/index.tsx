import { Slot } from '@openedx/frontend-base';

import CourseSidebar from '@src/course-about/course-sidebar/CourseSidebar';
import type { CourseAboutData, ShareTarget } from '@src/course-about/types';

export interface CourseAboutSidebarSlotProps {
  courseAboutData: CourseAboutData;
  /** Share policy for this render, forwarded so customizers can honour it. */
  shareTarget?: ShareTarget;
}

/**
 * The v1 default child speaks the older tri-state: `undefined` shares the
 * current page, an href shares that page, and `null` hides sharing.
 */
const toShareUrl = (shareTarget?: ShareTarget) => {
  if (!shareTarget || shareTarget.kind === 'current-page') {
    return undefined;
  }

  return shareTarget.kind === 'url' ? shareTarget.href : null;
};

const CourseAboutSidebarSlot = ({
  courseAboutData,
  shareTarget,
}: CourseAboutSidebarSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutSidebar.v1"
    courseAboutData={courseAboutData}
    shareTarget={shareTarget}
  >
    <aside>
      <CourseSidebar courseAboutData={courseAboutData} shareUrl={toShareUrl(shareTarget)} />
    </aside>
  </Slot>
);

export default CourseAboutSidebarSlot;
