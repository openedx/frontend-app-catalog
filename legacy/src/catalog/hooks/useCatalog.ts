import { useCallback } from 'react';

import type { DataTableParams, DataTableFilter } from '@src/data/course-list-search/types';
import { DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';
import { useSearch } from './useSearch';
import { useFilter } from './useFilter';
import { usePagination } from './usePagination';
import { useCourseData } from './useCourseData';
import type { UseCatalogProps } from './types';

/**
 * Main catalog hook that orchestrates all catalog functionality.
 *
 * This hook combines multiple specialized hooks to provide a complete
 * catalog management solution with search, filtering, pagination, and data caching.
 *
 * Features:
 * - Search functionality
 * - Filter management with intelligent change detection
 * - Pagination state management
 * - Course data caching for better UX
 * - Coordinated data fetching with proper state management
 */
export const useCatalog = ({
  fetchData,
  courseData,
  isFetching,
  searchParams,
  setSearchParams,
}: UseCatalogProps) => {
  const {
    hasInitializedFromUrl,
    urlSearchQuery,
    searchString,
    handleSearch,
  } = useSearch({
    fetchData, isFetching, searchParams, setSearchParams,
  });

  const { filterState, resetFilterProgress, handleFilterChange } = useFilter();

  const { pageIndex, handlePageChange, resetPagination } = usePagination();

  const { previousCourseData } = useCourseData({
    courseData,
    searchString,
  });

  const handleFetchData = useCallback((params: DataTableParams) => {
    const { pageIndex: newPageIndex, filters: newFilters } = params;

    const filterChanged = handleFilterChange(newFilters as DataTableFilter[], fetchData, searchString);

    if (filterChanged) {
      resetPagination();
      return;
    }

    handlePageChange(newPageIndex ?? DEFAULT_PAGE_INDEX);
    fetchData({ ...params, searchString });
  }, [handleFilterChange, fetchData, searchString, resetPagination, handlePageChange]);

  return {
    pageIndex,
    filterState,
    searchString,
    hasInitializedFromUrl,
    urlSearchQuery,
    previousCourseData,
    handleSearch,
    handleFetchData,
    resetFilterProgress,
  };
};
