import { useState, useCallback } from 'react';

import { DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';
import type { DataTableParams } from '@src/data/course-list-search/types';
import { compareFilters } from '../utils';

const INITIAL_FILTER_STATE = {
  previousFilters: null,
  isFilterChangeInProgress: false,
};

/**
 * Custom hook for managing filter state and pagination logic.
 */
export const useFilterState = (fetchData: (params: DataTableParams) => void) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX);
  const [filterState, setFilterState] = useState(INITIAL_FILTER_STATE);

  /**
   * Handles data fetching with intelligent filter and pagination logic.
   *
   * This function:
   * - Compares new filters with previous filters to detect changes
   * - Resets pagination to page 0 when filters change
   * - Prevents duplicate calls during filter transitions
   * - Handles both filter changes and pagination separately
   */
  const handleFetchData = useCallback((params) => {
    const { pageIndex: newPageIndex, filters: newFilters } = params;

    const hasFilters = newFilters && Object.keys(newFilters).length > 0;
    const hadFilters = filterState.previousFilters && Object.keys(filterState.previousFilters).length > 0;
    const filtersChanged = filterState.previousFilters !== null
      && !compareFilters(newFilters, filterState.previousFilters);
    const isFirstFilterApplied = !hadFilters && hasFilters;

    if (filterState.isFilterChangeInProgress) {
      return;
    }

    if (filtersChanged || isFirstFilterApplied) {
      setFilterState(prev => ({
        ...prev,
        isFilterChangeInProgress: true,
        previousFilters: newFilters || {},
      }));
      setPageIndex(0);
      fetchData({ ...params, pageIndex: 0 });
      return;
    }

    setPageIndex(newPageIndex);
    fetchData(params);
  }, [fetchData, filterState.previousFilters, filterState.isFilterChangeInProgress]);

  const resetFilterProgress = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      isFilterChangeInProgress: false,
    }));
  }, []);

  return {
    pageIndex,
    filterState,
    handleFetchData,
    resetFilterProgress,
  };
};
