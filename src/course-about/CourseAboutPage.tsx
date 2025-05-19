import { useLocation } from 'react-router';
import { Container, Layout, Alert } from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import { Loading } from '../generic';
import CourseMedia from './course-intro/course-media/CourseMedia';
import { CourseIntro } from './course-intro/CourseIntro';
import { useCourseAboutData } from './data/hooks';
import { GRID_LAYOUT } from './constants';
import messages from './messages';

const CourseAboutPage = () => {
  const intl = useIntl();
  const courseId = useLocation().pathname.split('/')[2];
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
    </Container>
  );
};

export default CourseAboutPage;
