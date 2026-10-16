import { useMemo } from 'react';
import {
  Layout, Stack, useMediaQuery, breakpoints,
} from '@openedx/paragon';

import { resolveShareTarget } from '@src/generic/share-links';
import CourseAboutIntroSlot from '@src/slots/CourseAboutIntroSlot';
import CourseAboutCourseMediaSlot from '@src/slots/CourseAboutCourseMediaSlot';
import CourseAboutOverviewSlot from '@src/slots/CourseAboutOverviewSlot';
import CourseAboutSidebarSlot from '@src/slots/CourseAboutSidebarSlot';
import { expandCourseAboutData } from './fallback';
import type { CourseAboutInput } from './types';
import { GRID_LAYOUT } from './layout';

export interface CourseAboutBodyProps {
  courseAboutData: CourseAboutInput;
  hideActions?: boolean;
  /**
   * Social share target for the sidebar. Omitted shares the current page
   * (standalone page default); a valid URL shares that page; null, an empty
   * string or an unusable value hides the social controls, e.g. when the
   * caller cannot resolve a public course URL.
   */
  shareUrl?: string | null;
}

const CourseAboutBody = ({
  courseAboutData,
  hideActions = false,
  shareUrl,
}: CourseAboutBodyProps) => {
  const isSmallScreen = useMediaQuery({ maxWidth: breakpoints.large.maxWidth });
  const { id: courseId } = courseAboutData;
  // v1 Slot Adapters read the complete record; expansion tops up only what the
  // source omitted. Memoised so the expanded record keeps a stable identity.
  const slotData = useMemo(() => expandCourseAboutData(courseAboutData), [courseAboutData]);
  const shareTarget = resolveShareTarget(shareUrl);

  return (
    <Layout {...GRID_LAYOUT}>
      <Layout.Element>
        {isSmallScreen ? (
          <Stack gap={4}>
            <Layout.Element className="course-media-wrapper text-center">
              <CourseAboutCourseMediaSlot courseAboutData={slotData} />
            </Layout.Element>
            <CourseAboutIntroSlot courseAboutData={slotData} hideActions={hideActions} />
            <CourseAboutOverviewSlot
              overviewData={slotData.overview}
              courseId={courseId}
              hideActions={hideActions}
            />
            <CourseAboutSidebarSlot courseAboutData={slotData} shareTarget={shareTarget} />
          </Stack>
        ) : (
          <Stack gap={4}>
            <CourseAboutIntroSlot courseAboutData={slotData} hideActions={hideActions} />
            <CourseAboutOverviewSlot
              overviewData={slotData.overview}
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
              <CourseAboutCourseMediaSlot courseAboutData={slotData} />
            </Layout.Element>
            <CourseAboutSidebarSlot courseAboutData={slotData} shareTarget={shareTarget} />
          </Stack>
        )}
      </Layout.Element>
    </Layout>
  );
};

export default CourseAboutBody;
