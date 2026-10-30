import {
  ErrorPage, getAppConfig, getUrlByRouteRole, useIntl,
} from '@openedx/frontend-base';
import {
  Alert, Button, CardGrid, Container,
} from '@openedx/paragon';
import { useNavigate } from 'react-router';

import { useCatalogSearch } from '@src/data/catalog-search/hooks';
import { AlertNotification } from '@src/generic';
import { DEFAULT_PAGE_INDEX } from '@src/data/catalog-search/constants';
import HomeCourseCardSlot from '@src/slots/HomeCourseCardSlot';
import HomePathwayCardSlot from '@src/slots/HomePathwayCardSlot';
import { LoaderSlot } from '@src/slots/LoaderSlot';
import type { CatalogSearchResult } from '@src/data/catalog-search/types';
import { appId, coursesRole } from '@src/constants';
import { getCountConfig, getStringConfig } from '@src/config';
import { DEFAULT_COURSES_COUNT } from '@src/home/constants';

import messages from './messages';

const CARD_GRID_LAYOUT = {
  xs: 12, md: 6, lg: 4, xl: 3,
};

const CoursesList = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const maxCourses = getCountConfig('HOMEPAGE_COURSE_MAX', DEFAULT_COURSES_COUNT);

  const {
    data: catalogData,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
  } = useCatalogSearch({
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
      {!catalogData?.results?.length ? (
        <AlertNotification
          className="my-0"
          variant="info"
          title={intl.formatMessage(messages.noItemsAvailable)}
          message={intl.formatMessage(messages.noItemsAvailableMessage)}
        />
      ) : (
        <Container className="text-center">
          <CardGrid columnSizes={CARD_GRID_LAYOUT}>
            {catalogData?.results?.map((result: CatalogSearchResult) => (
              result.type === 'pathway' ? (
                <HomePathwayCardSlot key={result.id} original={result} />
              ) : (
                <HomeCourseCardSlot key={result.id} original={result} />
              )
            ))}
          </CardGrid>
          {catalogData?.total > maxCourses && (
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
