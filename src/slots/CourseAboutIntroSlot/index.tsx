import type { CourseAboutDataPartial } from '@src/course-about/types';
import { CourseIntro } from '@src/course-about/course-intro/CourseIntro';

const CourseAboutIntroSlot = ({ courseAboutData }: { courseAboutData: CourseAboutDataPartial }) => (
  <>
    <CourseIntro courseAboutData={courseAboutData} />
  </>
);

export default CourseAboutIntroSlot;
