import { Slot } from '@openedx/frontend-base';

import CourseMedia from '@src/course-about/course-intro/course-media/CourseMedia';
import type { CourseMediaPartial } from '@src/course-about/types';

export interface CourseAboutCourseMediaSlotProps {
  courseAboutData: {
    name: string;
    media: CourseMediaPartial;
  };
}

const CourseAboutCourseMediaSlot = ({ courseAboutData }: CourseAboutCourseMediaSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutCourseMedia.v1"
    courseAboutData={courseAboutData}
  >
    <CourseMedia courseAboutData={courseAboutData} />
  </Slot>
);

export default CourseAboutCourseMediaSlot;
