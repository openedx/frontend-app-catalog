import { CourseOverview } from '@src/course-about/course-overview';
import type { CourseOverviewProps } from '@src/course-about/course-overview/types';

const CourseAboutOverviewSlot = ({ overviewData, courseId }: CourseOverviewProps) => (
  <>
    <CourseOverview overviewData={overviewData} courseId={courseId} />
  </>
);

export default CourseAboutOverviewSlot;
