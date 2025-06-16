import { useLocation } from 'react-router';
import {
  Container, Layout, Alert, Button, useMediaQuery, breakpoints,
} from '@openedx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import { Loading } from '../generic';
import CourseMedia from './course-intro/course-media/CourseMedia';
import { CourseIntro } from './course-intro/CourseIntro';
import { useCourseAboutData } from './data/hooks';
import CourseSidebar from './course-sidebar/CourseSidebar';
import { GRID_LAYOUT } from './constants';
import { hasVisibleContent, processOverviewContent } from './utils';
import messages from './messages';

const CourseAboutPage = () => {
  const intl = useIntl();
  const courseId = useLocation().pathname.split('/')[2];
  const authenticatedUser = getAuthenticatedUser();
  const isGlobalStaff = authenticatedUser?.administrator || false;
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth });

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

  const processedOverview = processOverviewContent(courseAboutData.overview, getConfig().LMS_BASE_URL);

  const hasOverviewContent = hasVisibleContent(processedOverview);

  return (
    <Container className="container-xl py-5.5" data-testid="course-about-page">
      <div className="course-about-intro-wrapper">
        <Layout {...GRID_LAYOUT}>
          <Layout.Element>
            <CourseIntro courseAboutData={courseAboutData} />
          </Layout.Element>
          <Layout.Element className="course-media-wrapper">
            <CourseMedia courseAboutData={courseAboutData} />
          </Layout.Element>
        </Layout>
      </div>
      <Layout {...GRID_LAYOUT}>
        <Layout.Element>
          <Container className="course-about-overview mb-4">
            {isGlobalStaff && (
              <Button
                as="a"
                size="sm"
                block={isExtraSmall}
                variant="outline-primary"
                href={courseAboutData.studioUrl}
                className={classNames(
                  'float-right',
                  isExtraSmall ? 'mx-0' : 'm-1',
                )}
              >
                {intl.formatMessage(messages.viewAboutPageInStudio)}
              </Button>
            )}
            {hasOverviewContent ? (
              /* eslint-disable-next-line react/no-danger */
              <div className="course-about-overview-content" dangerouslySetInnerHTML={{ __html: processedOverview }} />
            ) : (
              <div className="course-about-no-course-overview text-center">
                <p className="m-0">{intl.formatMessage(messages.noCourseOverview)}</p>
              </div>
            )}
          </Container>
        </Layout.Element>
        <Layout.Element>
          <aside>
            <CourseSidebar courseAboutData={courseAboutData} />
          </aside>
        </Layout.Element>
      </Layout>
    </Container>
  );
};

export default CourseAboutPage;
