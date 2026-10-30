import { Slot } from '@openedx/frontend-base';

import type { CourseAboutDataPartial } from '@src/course-about/types';
import { CourseIntro } from '@src/course-about/course-intro/CourseIntro';

export interface CourseAboutIntroSlotProps {
  courseAboutData: CourseAboutDataPartial;
  hideActions?: boolean;
}

const CourseAboutIntroSlot = ({ courseAboutData, hideActions = false }: CourseAboutIntroSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutIntro.v1"
    courseAboutData={courseAboutData}
    hideActions={hideActions}
  >
    <CourseIntro courseAboutData={courseAboutData} hideActions={hideActions} />
  </Slot>
);

export default CourseAboutIntroSlot;
