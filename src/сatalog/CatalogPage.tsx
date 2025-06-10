import {
  CardGrid, Container, Layout, Alert,
} from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import {
  AlertNotification, CourseCard, Loading, SubHeader,
} from '../generic';
import { useCourseDiscovery } from './data/hooks';
import messages from './messages';

const GRID_LAYOUT = { xl: [{ span: 9 }, { span: 3 }] };

const CatalogPage = () => {
  const intl = useIntl();
  const {
    data: courseData,
    isLoading,
    isError,
  } = useCourseDiscovery();

  if (isLoading) {
    return (
      <Loading />
    );
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

  const totalCourses = courseData?.results?.length ?? 0;

  return (
    <Container className="container-xl pt-5.5" data-testid="catalog-page">
      <SubHeader title={intl.formatMessage(messages.totalCoursesHeading, {
        totalCourses,
      })}
      />
      <Layout {...GRID_LAYOUT}>
        <Layout.Element>
          {totalCourses === 0 ? (
            <AlertNotification
              variant="info"
              title={intl.formatMessage(messages.noCoursesAvailable)}
              message={intl.formatMessage(messages.noCoursesAvailableMessage)}
            />
          ) : (
            <CardGrid
              hasEqualColumnHeights
              className="course-list-wrapper"
            >
              {courseData?.results?.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                />
              ))}
            </CardGrid>
          )}
        </Layout.Element>
        <Layout.Element>
          {totalCourses > 0 && (
          <aside className="sidebar-wrapper">
            {/* TODO: Implement sidebar functionality with filters and additional course information */}
          </aside>
          )}
        </Layout.Element>
      </Layout>
    </Container>
  );
};

export default CatalogPage;
