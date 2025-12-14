import { useEffect, useMemo } from 'react';
import { Container, Alert } from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import { useCourseListSearch } from '@src/data/course-list-search/hooks';
import CourseCatalogIntroSlot from '@src/plugin-slots/CourseCatalogIntroSlot';
import { CourseCatalogDataTableSlot } from '@src/plugin-slots/CourseCatalogDataTableSlots';
import CourseCatalogSearchFieldSlot from '@src/plugin-slots/CourseCatalogSearchFieldSlot';
import { useDebouncedSearchInput } from './hooks/useDebouncedSearchInput';
import { AlertNotification, Loading, Head } from '../generic';
import { useCatalog } from './hooks/useCatalog';
import messages from './messages';
import { transformAggregationsToFilterChoices } from './utils';

const CatalogPage = () => {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search_query') || '';
  const {
    data: courseData,
    isLoading,
    isError,
    fetchData,
    isFetching,
  } = useCourseListSearch({ searchString: searchQuery });

  const {
    pageIndex,
    filterState,
    searchString,
    hasInitializedFromUrl,
    urlSearchQuery,
    previousCourseData,
    handleSearch,
    handleFetchData,
    resetFilterProgress,
  } = useCatalog({
    fetchData, courseData, isFetching, searchParams, setSearchParams,
  });

  const { setSearchInput } = useDebouncedSearchInput({
    searchString,
    handleSearch,
  });

  /**
   * Determines which data to display in the catalog based on search state and results.
   * Shows previous course data when:
   * - User has an active search but no results were found
   * This provides better UX by showing cached data instead of empty state.
   */
  const displayData = useMemo(() => {
    const hasSearchResults = (courseData?.results?.length ?? 0) > 0;
    const hasActiveSearch = Boolean(searchString);

    const shouldShowPreviousData = hasActiveSearch && !hasSearchResults && previousCourseData;

    return shouldShowPreviousData ? previousCourseData : courseData;
  }, [courseData, searchString, previousCourseData]);

  useEffect(() => {
    if (!isFetching && filterState.isFilterChangeInProgress) {
      resetFilterProgress();
    }
  }, [isFetching, filterState.isFilterChangeInProgress, resetFilterProgress]);

  const tableColumns = useMemo(
    () => transformAggregationsToFilterChoices(displayData?.aggs, intl),
    [displayData?.aggs, intl],
  );

  if (isLoading || (!hasInitializedFromUrl && urlSearchQuery)) {
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

  const totalCourses = displayData?.results?.length ?? 0;
  const pageCount = Math.ceil((displayData?.total || totalCourses) / DEFAULT_PAGE_SIZE);
  const hasCourses = totalCourses > 0 || (previousCourseData?.total ?? 0) > 0;

  return (
    <>
      <Head title={intl.formatMessage(messages.pageTitle)} />
      <Container fluid={false} size="xl" className="pt-5.5 mb-6">
        <CourseCatalogIntroSlot searchString={searchString} courseDataResultsLength={courseData?.results?.length} />
        {hasCourses ? (
          <>
            <CourseCatalogSearchFieldSlot
              setSearchInput={setSearchInput}
              handleSearch={handleSearch}
              initialSearchValue={searchString}
            />
            <CourseCatalogDataTableSlot
              displayData={displayData}
              totalCourses={totalCourses}
              pageCount={pageCount}
              pageIndex={pageIndex}
              tableColumns={tableColumns}
              handleFetchData={handleFetchData}
            />
          </>
        ) : (
          <AlertNotification
            title={intl.formatMessage(messages.noCoursesAvailable)}
            message={intl.formatMessage(messages.noCoursesAvailableMessage)}
          />
        )}
      </Container>
    </>
  );
};

export default CatalogPage;
