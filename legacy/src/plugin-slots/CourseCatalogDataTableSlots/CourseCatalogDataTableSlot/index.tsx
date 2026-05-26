import { PluginSlot } from '@openedx/frontend-plugin-framework';
import {
  breakpoints, DataTable, useMediaQuery, TextFilter,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
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
    <PluginSlot
      id="org.openedx.frontend.catalog.course_catalog_page.data_table"
      slotOptions={{
        mergeProps: true,
      }}
      pluginProps={{
        displayData,
        totalCourses,
        pageCount,
        pageIndex,
        tableColumns,
        handleFetchData,
      }}
    >
      <DataTable
        showFiltersInSidebar={!isMedium}
        numBreakoutFilters={0}
        isFilterable={getConfig().ENABLE_COURSE_DISCOVERY}
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
        // Using course ID as a unique identifier for DataTable rows.
        // This ensures stable keys for React reconciliation, preventing cards from being
        // repopulated with different data when filtering, sorting, or paginating.
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
    </PluginSlot>
  );
};

export default CourseCatalogDataTableSlot;
