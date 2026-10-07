import {
  Layout, Stack, useMediaQuery, breakpoints,
} from '@openedx/paragon';

import CourseAboutIntroSlot from '@src/slots/CourseAboutIntroSlot';
import CourseAboutCourseMediaSlot from '@src/slots/CourseAboutCourseMediaSlot';
import CourseAboutOverviewSlot from '@src/slots/CourseAboutOverviewSlot';
import CourseAboutSidebarSlot from '@src/slots/CourseAboutSidebarSlot';
import type { CourseAboutData } from './types';
import { GRID_LAYOUT } from './layout';

export interface CourseAboutBodyProps {
  courseAboutData: CourseAboutData;
  hideActions?: boolean;
}

const CourseAboutBody = ({ courseAboutData, hideActions = false }: CourseAboutBodyProps) => {
  const isSmallScreen = useMediaQuery({ maxWidth: breakpoints.large.maxWidth });
  const { id: courseId } = courseAboutData;

  return (
    <Layout {...GRID_LAYOUT}>
      <Layout.Element>
        {isSmallScreen ? (
          <Stack gap={4}>
            <Layout.Element className="course-media-wrapper text-center">
              <CourseAboutCourseMediaSlot courseAboutData={courseAboutData} />
            </Layout.Element>
            <CourseAboutIntroSlot courseAboutData={courseAboutData} hideActions={hideActions} />
            <CourseAboutOverviewSlot
              overviewData={courseAboutData.overview}
              courseId={courseId}
              hideActions={hideActions}
            />
            <CourseAboutSidebarSlot courseAboutData={courseAboutData} />
          </Stack>
        ) : (
          <Stack gap={4}>
            <CourseAboutIntroSlot courseAboutData={courseAboutData} hideActions={hideActions} />
            <CourseAboutOverviewSlot
              overviewData={courseAboutData.overview}
              courseId={courseId}
              hideActions={hideActions}
            />
          </Stack>
        )}
      </Layout.Element>
      <Layout.Element>
        {!isSmallScreen && (
          <Stack gap={4}>
            <Layout.Element className="course-media-wrapper">
              <CourseAboutCourseMediaSlot courseAboutData={courseAboutData} />
            </Layout.Element>
            <CourseAboutSidebarSlot courseAboutData={courseAboutData} />
          </Stack>
        )}
      </Layout.Element>
    </Layout>
  );
};

export default CourseAboutBody;
