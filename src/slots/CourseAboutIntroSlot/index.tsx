import { Slot } from '@openedx/frontend-base';

import type { CourseAboutDataPartial } from '@src/course-about/types';
import { CourseIntro } from '@src/course-about/course-intro/CourseIntro';

export interface CourseAboutIntroSlotProps {
  courseAboutData: CourseAboutDataPartial;
}

const CourseAboutIntroSlot = ({ courseAboutData }: CourseAboutIntroSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutIntro.v1"
    courseAboutData={courseAboutData}
  >
    <CourseIntro courseAboutData={courseAboutData} />
  </Slot>
);

export default CourseAboutIntroSlot;
