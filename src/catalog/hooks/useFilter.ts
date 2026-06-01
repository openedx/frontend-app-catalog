import { useState, useCallback } from 'react';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';
import type { DataTableFilter, DataTableParams } from '@src/data/course-list-search/types';
import { compareFilters } from '../utils';

const INITIAL_FILTER_STATE = {
  previousFilters: null as any[] | Record<string, any> | null,
  isFilterChangeInProgress: false,
};

/**
 * Custom hook for managing filter state and handling filter changes in the catalog.
 *
 * This hook provides functionality to:
 * - Track previous filter state to detect changes
 * - Prevent duplicate API calls during filter transitions
 * - Reset pagination when filters change
 * - Handle filter change progress state
 */
export const useFilter = () => {
  const [filterState, setFilterState] = useState(INITIAL_FILTER_STATE);

  /**
   * Resets the filter change progress flag.
   *
   * This function should be called when the API request completes
   * to allow new filter changes to be processed.
   */
  const resetFilterProgress = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      isFilterChangeInProgress: false,
    }));
  }, []);

  /**
   * Handles filter changes to prevent duplicate API calls.
   */
  const handleFilterChange = useCallback((
    newFilters: DataTableFilter[],
    fetchData: (params: DataTableParams) => void,
    searchString: string,
  ) => {
    const hasFilters = Array.isArray(newFilters) && Object.keys(newFilters).length > 0;
    const hadFilters = filterState.previousFilters && Object.keys(filterState.previousFilters).length > 0;
    const filtersChanged = filterState.previousFilters !== null
      && !compareFilters(newFilters, filterState.previousFilters as DataTableFilter[]);
    const isFirstFilterApplied = !hadFilters && hasFilters;

    if (filterState.isFilterChangeInProgress) {
      return false;
    }

    if (filtersChanged || isFirstFilterApplied) {
      setFilterState(prev => ({
        ...prev,
        isFilterChangeInProgress: true,
        previousFilters: newFilters || {},
      }));

      fetchData({
        pageIndex: DEFAULT_PAGE_INDEX,
        pageSize: DEFAULT_PAGE_SIZE,
        filters: newFilters,
        searchString,
      });
      return true;
    }

    return false;
  }, [filterState]);

  return {
    filterState,
    resetFilterProgress,
    handleFilterChange,
  };
};
