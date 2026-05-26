import { ErrorPage, useIntl } from '@openedx/frontend-base';
import {
  Alert, Button, CardGrid, Container,
} from '@openedx/paragon';
import { useNavigate } from 'react-router';

import { useCourseListSearch } from '@src/data/course-list-search/hooks';
import { getCatalogConfig } from '@src/data/appConfig';
import { AlertNotification } from '@src/generic';
import { DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';
import HomeCourseCardSlot from '@src/slots/HomeCourseCardSlot';
import { LoaderSlot } from '@src/slots/LoaderSlot';
import { ROUTES } from '@src/constants';
import { DEFAULT_COURSES_COUNT } from '@src/home/constants';

import messages from './messages';

const CARD_GRID_LAYOUT = {
  xs: 12, md: 6, lg: 4, xl: 3,
};

const CoursesList = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const maxCourses = getCatalogConfig().HOMEPAGE_COURSE_MAX || DEFAULT_COURSES_COUNT;

  const {
    data: courseData,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
  } = useCourseListSearch({
    pageSize: maxCourses,
    pageIndex: DEFAULT_PAGE_INDEX,
    enableCourseSortingByStartDate: getCatalogConfig().ENABLE_COURSE_SORTING_BY_START_DATE || false,
  });

  const handleNavigateToCoursesPage = () => {
    navigate(ROUTES.COURSES);
  };

  if (isCoursesLoading) {
    return (
      <Container className="py-6" size="xl" data-testid="courses-list-loading">
        <LoaderSlot>
          <CardGrid columnSizes={CARD_GRID_LAYOUT}>
            {Array.from({ length: maxCourses }, (_, index) => (
              <HomeCourseCardSlot key={`courses-list-loading-skeleton-card-${index}`} isLoading />
            ))}
          </CardGrid>
        </LoaderSlot>
      </Container>
    );
  }

  if (isCoursesError) {
    return (
      <Container className="py-6" size="xl">
        <Alert className="my-0" variant="danger">
          {/* ErrorPage typings claim message must be null/undefined but its
              runtime renders the prop as text. Cast until upstream fix. */}
          <ErrorPage
            message={intl.formatMessage(messages.errorMessage, {
              supportEmail: getCatalogConfig().INFO_EMAIL,
            }) as unknown as null}
          />
        </Alert>
      </Container>
    );
  }

  if (getCatalogConfig().NON_BROWSABLE_COURSES) {
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
              <HomeCourseCardSlot key={course.id} original={course} />
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
