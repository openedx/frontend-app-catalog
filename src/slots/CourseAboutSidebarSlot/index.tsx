import CourseSidebar from '@src/course-about/course-sidebar/CourseSidebar';
import type { CourseAboutData } from '@src/course-about/types';

const CourseAboutSidebarSlot = ({ courseAboutData }: { courseAboutData: CourseAboutData }) => (
  <>
    <aside>
      <CourseSidebar courseAboutData={courseAboutData} />
    </aside>
  </>
);

export default CourseAboutSidebarSlot;
