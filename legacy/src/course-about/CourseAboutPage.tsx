import { useLocation } from 'react-router';
import {
  Container, Layout, Alert, useMediaQuery, breakpoints, Stack,
} from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import { Loading, Head } from '@src/generic';
import CourseAboutIntroSlot from '@src/plugin-slots/CourseAboutIntroSlot';
import CourseAboutCourseMediaSlot from '@src/plugin-slots/CourseAboutCourseMediaSlot';
import CourseAboutOverviewSlot from '@src/plugin-slots/CourseAboutOverviewSlot';
import CourseAboutSidebarSlot from '@src/plugin-slots/CourseAboutSidebarSlot';
import { useCourseAboutData } from './data/hooks';
import messages from './messages';
import { GRID_LAYOUT } from './layout';

const CourseAboutPage = () => {
  const intl = useIntl();
  const courseId = useLocation().pathname.split('/')[2];
  const isSmallScreen = useMediaQuery({ maxWidth: breakpoints.large.maxWidth });
  const {
    data: courseAboutData,
    isLoading,
    isError,
  } = useCourseAboutData(courseId);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Container className="py-5.5">
        <Alert variant="danger">
          <ErrorPage
            message={intl.formatMessage(messages.errorMessage, {
              supportEmail: getConfig().INFO_EMAIL,
            })}
          />
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Head title={courseAboutData?.name || ''} />
      <Container fluid={false} size="xl" className="py-5.5">
        <Layout {...GRID_LAYOUT}>
          <Layout.Element>
            {isSmallScreen ? (
              <Stack gap={4}>
                <Layout.Element className="course-media-wrapper text-center">
                  <CourseAboutCourseMediaSlot courseAboutData={courseAboutData} />
                </Layout.Element>
                <CourseAboutIntroSlot courseAboutData={courseAboutData} />
                <CourseAboutOverviewSlot
                  overviewData={courseAboutData.overview}
                  courseId={courseId}
                />
                <CourseAboutSidebarSlot courseAboutData={courseAboutData} />
              </Stack>
            ) : (
              <Stack gap={4}>
                <CourseAboutIntroSlot courseAboutData={courseAboutData} />
                <CourseAboutOverviewSlot
                  overviewData={courseAboutData.overview}
                  courseId={courseId}
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
      </Container>
    </>
  );
};

export default CourseAboutPage;
