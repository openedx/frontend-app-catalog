import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert, Button, CardGrid, Container,
} from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useNavigate } from 'react-router';

import { useCourseDiscovery } from '@src/data/course-discovery/hooks';
import { AlertNotification, Loading } from '@src/generic';
import { DEFAULT_PAGE_INDEX } from '@src/data/course-discovery/constants';
import HomeCourseCardSlot from '@src/plugin-slots/HomeCourseCardSlot';
import { ROUTES } from '@src/routes';
import { DEFAULT_COURSES_COUNT } from '@src/home/constants';

import messages from './messages';

const CARD_GRID_LAYOUT = {
  xs: 12, md: 6, lg: 4, xl: 3,
};

const CoursesList = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const maxCourses = getConfig().HOMEPAGE_COURSE_MAX || DEFAULT_COURSES_COUNT;

  const {
    data: courseData,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
  } = useCourseDiscovery({
    pageSize: maxCourses,
    pageIndex: DEFAULT_PAGE_INDEX,
    enableCourseSortingByStartDate: getConfig().ENABLE_COURSE_SORTING_BY_START_DATE || false,
  });

  const handleNavigateToCoursesPage = () => {
    navigate(ROUTES.COURSES);
  };

  if (isCoursesLoading) {
    return (
      <Loading />
    );
  }

  if (isCoursesError) {
    return (
      <Container className="py-6" size="xl">
        <Alert className="my-0" variant="danger">
          <ErrorPage
            message={intl.formatMessage(messages.errorMessage, {
              supportEmail: getConfig().INFO_EMAIL,
            })}
          />
        </Alert>
      </Container>
    );
  }

  if (getConfig().NON_BROWSABLE_COURSES) {
    return null;
  }

  return (
    <Container
      className="py-6"
      size="xl"
      data-testid="courses-list"
    >
      {!courseData?.results?.length ? (
        <AlertNotification
          className="my-0"
          variant="info"
          title={intl.formatMessage(messages.noCoursesAvailable)}
          message={intl.formatMessage(messages.noCoursesAvailableMessage)}
        />
      ) : (
        <Container className="text-center">
          <CardGrid columnSizes={CARD_GRID_LAYOUT}>
            {courseData?.results?.map(course => (
              <HomeCourseCardSlot key={course.id} course={course} />
            ))}
          </CardGrid>
          {courseData?.total > maxCourses && (
            <Button
              className="mt-3"
              variant="brand"
              onClick={handleNavigateToCoursesPage}
            >
              {intl.formatMessage(messages.viewAllCoursesButton)}
            </Button>
          )}
        </Container>
      )}
    </Container>
  );
};

export default CoursesList;
