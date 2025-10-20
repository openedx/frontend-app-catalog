import { useEffect, useMemo } from 'react';
import {
  DataTable, Container, SearchField, Alert, breakpoints,
  useMediaQuery, TextFilter, CardView,
} from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';
import { useCourseListSearch } from '@src/data/course-list-search/hooks';
import {
  AlertNotification, CourseCard, Loading, SubHeader,
} from '../generic';
import { useFilterState } from './hooks/useFilterState';
import messages from './messages';
import { transformAggregationsToFilterChoices } from './utils';

const CatalogPage = () => {
  const intl = useIntl();
  const {
    data: courseData,
    isLoading,
    isError,
    fetchData,
    isFetching,
  } = useCourseListSearch();
  const isMedium = useMediaQuery({ maxWidth: breakpoints.large.maxWidth });

  const {
    pageIndex,
    filterState,
    handleFetchData,
    resetFilterProgress,
  } = useFilterState(fetchData);

  useEffect(() => {
    fetchData({ pageIndex: DEFAULT_PAGE_INDEX, pageSize: DEFAULT_PAGE_SIZE });
  }, [fetchData]);

  useEffect(() => {
    if (!isFetching && filterState.isFilterChangeInProgress) {
      resetFilterProgress();
    }
  }, [isFetching, filterState.isFilterChangeInProgress, resetFilterProgress]);

  const tableColumns = useMemo(
    () => transformAggregationsToFilterChoices(courseData?.aggs, intl),
    [courseData],
  );

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
  const pageCount = Math.ceil((courseData?.total || totalCourses) / DEFAULT_PAGE_SIZE);

  return (
    <Container fluid={false} size="xl" className="pt-5.5 mb-6">
      <SubHeader
        title={intl.formatMessage(messages.exploreCourses)}
        className={classNames({ 'mx-2.5': isMedium })}
      />
      {totalCourses > 0 ? (
        <>
          <SearchField
            key="search-field"
            className={classNames({
              'w-auto mx-2.5 mb-0': isMedium,
              'mb-4 w-25': !isMedium,
            })}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
          />
          <DataTable
            isLoading={isFetching}
            showFiltersInSidebar={!isMedium}
            isFilterable={getConfig().ENABLE_COURSE_DISCOVERY}
            isSortable
            isPaginated
            manualFilters
            manualPagination
            defaultColumnValues={{ Filter: TextFilter }}
            itemCount={courseData?.total || totalCourses}
            pageSize={DEFAULT_PAGE_SIZE}
            pageCount={pageCount}
            initialState={{ pageSize: DEFAULT_PAGE_SIZE, pageIndex }}
            data={courseData?.results}
            columns={tableColumns}
            fetchData={handleFetchData}
          >
            <DataTable.TableControlBar />
            <CardView CardComponent={CourseCard} skeletonCardCount={3} />
            <DataTable.EmptyTable content={intl.formatMessage(messages.noResultsFound)} />
            <DataTable.TableFooter />
          </DataTable>
        </>
      ) : (
        <AlertNotification
          title={intl.formatMessage(messages.noCoursesAvailable)}
          message={intl.formatMessage(messages.noCoursesAvailableMessage)}
        />
      )}
    </Container>
  );
};

export default CatalogPage;
