import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert, Button, CardGrid, Container,
} from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useNavigate } from 'react-router';

import { useCourseDiscovery } from '../../../data/course-discovery/hooks';
import { AlertNotification, CourseCard, Loading } from '../../../generic';
import { DEFAULT_PAGE_INDEX } from '../../../data/course-discovery/constants';
import { ROUTES } from '../../../routes';
import { useHomeSettingsQuery } from '../../data/hooks';
import { DEFAULT_COURSES_COUNT } from '../../data/constants';

import messages from './messages';

const CARD_LAYOUT = {
  xs: 12, md: 6, lg: 4, xl: 3,
};

const CoursesList = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { data: homeSettingsData } = useHomeSettingsQuery();

  const maxCourses = homeSettingsData?.homepageCourseMax || DEFAULT_COURSES_COUNT;
  const enableSortingByDate = homeSettingsData?.enableCourseSortingByStartDate;

  const {
    data: courseData,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
  } = useCourseDiscovery({
    pageSize: maxCourses,
    pageIndex: DEFAULT_PAGE_INDEX,
    enableCourseSortingByStartDate: enableSortingByDate || false,
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
    <Container className="container-xl pt-6" data-testid="courses-list">
      {!courseData?.results?.length ? (
        <AlertNotification
          variant="info"
          title={intl.formatMessage(messages.noCoursesAvailable)}
          message={intl.formatMessage(messages.noCoursesAvailableMessage)}
        />
      ) : (
        <div className="course-list-wrapper d-flex flex-column align-items-center">
          <CardGrid
            columnSizes={CARD_LAYOUT}
            hasEqualColumnHeights
            className="w-100"
          >
            {courseData?.results?.map(course => (
              <CourseCard
                key={course.id}
                course={course}
              />
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
        </div>
      )}
    </Container>
  );
};

export default CoursesList;
