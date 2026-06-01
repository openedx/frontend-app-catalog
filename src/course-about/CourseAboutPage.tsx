import { useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import {
  Container, Layout, Alert, useMediaQuery, breakpoints, Stack,
} from '@openedx/paragon';
import {
  ErrorPage, getAppConfig, getSiteConfig, useIntl,
} from '@openedx/frontend-base';

import { Loading } from '@src/generic';
import { appId } from '@src/constants';
import CourseAboutIntroSlot from '@src/slots/CourseAboutIntroSlot';
import CourseAboutCourseMediaSlot from '@src/slots/CourseAboutCourseMediaSlot';
import CourseAboutOverviewSlot from '@src/slots/CourseAboutOverviewSlot';
import CourseAboutSidebarSlot from '@src/slots/CourseAboutSidebarSlot';
import { useCourseAboutData } from './data/hooks';
import messages from './messages';
import { GRID_LAYOUT } from './layout';

const CourseAboutPage = () => {
  const intl = useIntl();
  const { courseId = '' } = useParams<{ courseId: string }>();
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
            // @ts-expect-error frontend-base ErrorPage declares message?: null but renders the prop as text. Remove when typing is fixed upstream.
            message={intl.formatMessage(messages.errorMessage, {
              supportEmail: getAppConfig(appId).INFO_EMAIL as string,
            })}
          />
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {intl.formatMessage(messages.pageTitle, {
            courseName: courseAboutData?.name ?? '',
            siteName: getSiteConfig().siteName,
          })}
        </title>
      </Helmet>
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
