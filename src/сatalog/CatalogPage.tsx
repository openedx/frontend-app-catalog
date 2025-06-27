import {
  Container, Alert, SearchField, DataTable, TextFilter,
  CardView, CheckboxFilter, useMediaQuery, breakpoints,
} from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import {
  AlertNotification,
  CourseCard,
  Loading,
  SubHeader,
} from '../generic';
import { useCourseDiscovery } from './data/hooks';
import { transformResultsForTable } from './utils';
import messages from './messages';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from './constants';

const enableCourseDiscovery = false;

const CatalogPage = () => {
  const intl = useIntl();
  const {
    data: courseData,
    isLoading,
    isError,
  } = useCourseDiscovery();
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
    <Container className="container-xl pt-5.5">
      <SubHeader
        title={intl.formatMessage(messages.exploreCourses)}
        className={classNames({ 'mx-2.5': isMedium })}
      />
      {totalCourses > 0 ? (
        <>
          <SearchField
            key=""
            className={classNames({
              'w-auto mx-2.5 mb-0': isMedium,
              'mb-4': !isMedium,
            })}
            value=""
            onSubmit={() => {}}
            onClear={() => {}}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
          />
          <DataTable
            isLoading={isLoading}
            showFiltersInSidebar={!isMedium}
            isFilterable={enableCourseDiscovery}
            isSortable
            isPaginated
            defaultColumnValues={{ Filter: TextFilter }}
            itemCount={totalCourses}
            initialState={{ pageSize: DEFAULT_PAGE_SIZE, pageIndex: DEFAULT_PAGE_INDEX }}
            data={transformResultsForTable(courseData?.results)}
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
