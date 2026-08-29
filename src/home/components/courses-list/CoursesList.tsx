import {
  ErrorPage, getAppConfig, getUrlByRouteRole, useIntl,
} from '@openedx/frontend-base';
import {
  Alert, Button, CardGrid, Container,
} from '@openedx/paragon';
import { useNavigate } from 'react-router';

import { useCourseListSearch } from '@src/data/course-list-search/hooks';
import { AlertNotification } from '@src/generic';
import { DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';
import HomeCourseCardSlot from '@src/slots/HomeCourseCardSlot';
import { LoaderSlot } from '@src/slots/LoaderSlot';
import { appId, coursesRole } from '@src/constants';
import { getStringConfig } from '@src/config';

import messages from './messages';

const CARD_GRID_LAYOUT = {
  xs: 12, md: 6, lg: 4, xl: 3,
};

const CoursesList = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const maxCourses = getAppConfig(appId).HOMEPAGE_COURSE_MAX as number;

  const {
    data: courseData,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
  } = useCourseListSearch({
    pageSize: maxCourses,
    pageIndex: DEFAULT_PAGE_INDEX,
    enableCourseSortingByStartDate: getAppConfig(appId).ENABLE_COURSE_SORTING_BY_START_DATE === true,
  });

  const handleNavigateToCoursesPage = () => {
    const coursesUrl = getUrlByRouteRole(coursesRole);
    if (coursesUrl) {
      navigate(coursesUrl);
    }
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

  if (getAppConfig(appId).NON_BROWSABLE_COURSES) {
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
