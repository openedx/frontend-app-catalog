import {
  DataTable, Container, SearchField, Alert, breakpoints,
  useMediaQuery, TextFilter, CheckboxFilter, CardView,
} from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';
import {
  AlertNotification, CourseCard, Loading, SubHeader,
} from '../generic';
import { useCourseListSearch } from '../data/course-list-search/hooks';
import messages from './messages';
import { transformResultsForTable } from './utils';

const CatalogPage = () => {
  const intl = useIntl();
  const {
    data: courseData,
    isLoading,
    isError,
  } = useCourseListSearch();
  const isMedium = useMediaQuery({ maxWidth: breakpoints.large.maxWidth });

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
    <Container className="container-xl pt-5.5 mb-6">
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
            isLoading={isLoading}
            showFiltersInSidebar={!isMedium}
            isFilterable={getConfig().ENABLE_COURSE_DISCOVERY}
            isSortable
            isPaginated
            defaultColumnValues={{ Filter: TextFilter }}
            itemCount={totalCourses}
            initialState={{ pageSize: DEFAULT_PAGE_SIZE, pageIndex: DEFAULT_PAGE_INDEX }}
            data={transformResultsForTable(courseData!.results)}
            columns={[
              {
                Header: 'Language',
                accessor: 'language',
                Filter: CheckboxFilter,
                filter: 'includesValue',
                filterChoices: [{
                  name: 'English',
                  number: 2,
                  value: 'English',
                },
                {
                  name: 'Ukrainian',
                  number: 2,
                  value: 'Ukrainian',
                },
                {
                  name: 'Spanish',
                  number: 1,
                  value: 'Spanish',
                }],
              },
            ]}
          >
            <DataTable.TableControlBar />
            <CardView CardComponent={CourseCard} />
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
