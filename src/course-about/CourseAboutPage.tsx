import { useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import { Container, Alert } from '@openedx/paragon';
import {
  ErrorPage, getSiteConfig, useIntl,
} from '@openedx/frontend-base';

import { Loading } from '@src/generic';
import { getStringConfig } from '@src/config';
import CourseAboutBody from './CourseAboutBody';
import { useCourseAboutData } from './data/hooks';
import messages from './messages';

const CourseAboutPage = () => {
  const intl = useIntl();
  const { courseId = '' } = useParams<{ courseId: string }>();
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
              supportEmail: getStringConfig('INFO_EMAIL'),
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
        <CourseAboutBody courseAboutData={courseAboutData} />
      </Container>
    </>
  );
};

export default CourseAboutPage;
