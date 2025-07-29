import { useLocation } from 'react-router';
import { Container, Layout, Alert } from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import { Loading } from '../generic';
import CourseAboutIntroSlot from '../plugin-slots/CourseAboutIntroSlot';
import CourseMedia from './course-intro/course-media/CourseMedia';
import { useCourseAboutData } from './data/hooks';
import messages from './messages';

export const GRID_LAYOUT = {
  xs: [{ span: 12 }, { span: 'auto' }],
  xl: [{ span: 9 }, { span: 3 }],
};

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
    <Container className="course-about-intro-wrapper container-xl py-5.5">
      <Layout {...GRID_LAYOUT}>
        <Layout.Element>
          <CourseAboutIntroSlot courseAboutData={courseAboutData} />
        </Layout.Element>
        <Layout.Element className="course-media-wrapper">
          <CourseMedia courseAboutData={courseAboutData} />
        </Layout.Element>
      </Layout>
    </Container>
  );
};

export default CourseAboutPage;
