import {
  breakpoints, DataTable, useMediaQuery, TextFilter,
} from '@openedx/paragon';
import { getAppConfig, useIntl } from '@openedx/frontend-base';

import { appId } from '@src/constants';
import { DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import messages from '@src/catalog/messages';
import type { CourseCatalogDataTableSlotProps } from './types';

import CourseCatalogDataTableControlBarSlot from '../CourseCatalogDataTableControlBarSlot';
import CourseCatalogDataTableCardViewSlot from '../CourseCatalogDataTableCardViewSlot';
import CourseCatalogDataTableTableFooterSlot from '../CourseCatalogDataTableTableFooterSlot';

const CourseCatalogDataTableSlot = ({
  displayData,
  totalCourses,
  pageCount,
  pageIndex,
  tableColumns,
  handleFetchData,
}: CourseCatalogDataTableSlotProps) => {
  const intl = useIntl();
  const isMedium = useMediaQuery({ maxWidth: breakpoints.large.maxWidth });

  return (
    <>
      <DataTable
        showFiltersInSidebar={!isMedium}
        numBreakoutFilters={0}
        isFilterable={getAppConfig(appId).ENABLE_COURSE_DISCOVERY === true}
        isSortable
        isPaginated
        manualFilters
        manualPagination
        defaultColumnValues={{ Filter: TextFilter }}
        itemCount={displayData?.total || totalCourses}
        pageSize={DEFAULT_PAGE_SIZE}
        pageCount={pageCount}
        initialState={{ pageSize: DEFAULT_PAGE_SIZE, pageIndex }}
        data={displayData?.results}
        columns={tableColumns}
        fetchData={handleFetchData}
        initialTableOptions={{ getRowId: (row) => row.id }}
      >
        <CourseCatalogDataTableControlBarSlot
          currentPageResultsCount={displayData?.results?.length ?? 0}
          totalResultsCount={displayData?.total ?? 0}
        />
        <CourseCatalogDataTableCardViewSlot displayData={displayData} />
        <DataTable.EmptyTable content={intl.formatMessage(messages.noResultsFound)} />
        <CourseCatalogDataTableTableFooterSlot />
      </DataTable>
    </>
  );
};

export default CourseCatalogDataTableSlot;
