import CourseMedia from '@src/course-about/course-intro/course-media/CourseMedia';
import type { CourseAboutCourseMediaSlotProps } from './types';

const CourseAboutCourseMediaSlot = ({ courseAboutData }: CourseAboutCourseMediaSlotProps) => (
  <>
    <CourseMedia courseAboutData={courseAboutData} />
  </>
);

export default CourseAboutCourseMediaSlot;
