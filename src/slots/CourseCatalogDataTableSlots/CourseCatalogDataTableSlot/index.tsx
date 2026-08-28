import {
  breakpoints, DataTable, useMediaQuery, TextFilter,
} from '@openedx/paragon';
import { getAppConfig, Slot, useIntl } from '@openedx/frontend-base';

import { appId } from '@src/constants';
import { DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import messages from '@src/catalog/messages';
import type { CourseListSearchResponse, DataTableParams } from '@src/data/course-list-search/types';

import CourseCatalogDataTableControlBarSlot from '../CourseCatalogDataTableControlBarSlot';
import CourseCatalogDataTableCardViewSlot from '../CourseCatalogDataTableCardViewSlot';
import CourseCatalogDataTableTableFooterSlot from '../CourseCatalogDataTableTableFooterSlot';

export interface TableColumnFilterChoice {
  name: string;
  number: number;
  value: string;
}

export interface TableColumn {
  Header: string;
  accessor: string;
  Filter: React.ComponentType<any>;
  filter: string;
  filterChoices: TableColumnFilterChoice[];
}

export interface CourseCatalogDataTableSlotProps {
  displayData?: CourseListSearchResponse;
  totalCourses: number;
  pageCount: number;
  pageIndex: number;
  tableColumns: TableColumn[];
  handleFetchData: (params: DataTableParams) => void;
}

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
    <Slot
      id="org.openedx.frontend.slot.catalog.courseCatalogDataTable.v1"
      displayData={displayData}
      totalCourses={totalCourses}
      pageCount={pageCount}
      pageIndex={pageIndex}
      tableColumns={tableColumns}
      handleFetchData={handleFetchData}
    >
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
    </Slot>
  );
};

export default CourseCatalogDataTableSlot;
