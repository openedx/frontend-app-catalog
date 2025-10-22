import {
  useState, useCallback, useMemo, useEffect,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import type { DataTableParams, CourseListSearchResponse, DataTableFilter } from '@src/data/course-list-search/types';
import { compareFilters } from '../utils';

const INITIAL_FILTER_STATE = {
  previousFilters: null as any[] | Record<string, any> | null,
  isFilterChangeInProgress: false,
};

/**
 * Custom hook for managing filter state and pagination logic.
 */
export const useCatalogState = (
  fetchData: (params: DataTableParams) => void,
  courseData: CourseListSearchResponse | undefined,
  isFetching: boolean,
) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX);
  const [filterState, setFilterState] = useState(INITIAL_FILTER_STATE);
  const [searchString, setSearchString] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [previousCourseData, setPreviousCourseData] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [hasInitialized, setHasInitialized] = useState(false);

  const urlSearchQuery = useMemo(() => searchParams.get('search_query'), [searchParams]);

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

    const hasFilters = Array.isArray(newFilters) && Object.keys(newFilters).length > 0;
    const hadFilters = filterState.previousFilters && Object.keys(filterState.previousFilters).length > 0;
    const filtersChanged = filterState.previousFilters !== null
      && !compareFilters(newFilters as DataTableFilter[], filterState.previousFilters as DataTableFilter[]);
    const isFirstFilterApplied = !hadFilters && hasFilters;
    const shouldResetSearch = filtersChanged || isFirstFilterApplied || (newPageIndex !== pageIndex);

    if (shouldResetSearch) {
      setLastSearchQuery('');
    }

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
      fetchData({ ...params, pageIndex: 0, searchString });
      return;
    }

    setPageIndex(newPageIndex);
    fetchData({ ...params, searchString });
  }, [fetchData, filterState.previousFilters, filterState.isFilterChangeInProgress, searchString, pageIndex]);

  const resetFilterProgress = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      isFilterChangeInProgress: false,
    }));
  }, []);

  const savePreviousCourseData = useCallback((data) => {
    if (data && !searchString) {
      setPreviousCourseData(data);
    }
  }, [searchString]);

  const handleNoSearchResults = useCallback((searchQuery) => {
    setLastSearchQuery(searchQuery);
    setSearchString('');
    setSearchParams({});
  }, [setSearchParams]);

  const clearLastSearchQuery = useCallback(() => {
    setLastSearchQuery('');
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchString(query);
    setPageIndex(0);

    if (query) {
      setLastSearchQuery('');
    }

    setFilterState(prev => ({
      ...prev,
      isFilterChangeInProgress: true,
      previousFilters: [],
    }));

    setSearchParams(query ? { search_query: query } : {});

    fetchData({
      pageIndex: 0,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: query,
    });
  }, [fetchData, setSearchParams]);

  const handleClearSearch = useCallback(() => {
    setSearchString('');
    setLastSearchQuery('');
    setPageIndex(0);

    setFilterState(prev => ({
      ...prev,
      isFilterChangeInProgress: true,
      previousFilters: [],
    }));

    setSearchParams({});

    fetchData({
      pageIndex: 0,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
    });
  }, [fetchData, setSearchParams]);

  useEffect(() => {
    if (hasInitialized) {
      return;
    }

    if (urlSearchQuery && !searchString) {
      handleSearch(urlSearchQuery);
    } else if (!urlSearchQuery && !searchString) {
      fetchData({ pageIndex: DEFAULT_PAGE_INDEX, pageSize: DEFAULT_PAGE_SIZE, filters: [] });
    }

    setHasInitialized(true);
  }, [hasInitialized, urlSearchQuery, searchString, handleSearch, fetchData]);

  useEffect(() => {
    if (!isFetching && filterState.isFilterChangeInProgress) {
      resetFilterProgress();
    }

    if (!courseData) {
      return;
    }

    if (!searchString) {
      savePreviousCourseData(courseData);
      return;
    }

    const hasResults = (courseData.results?.length ?? 0) > 0;

    if (!isFetching) {
      if (hasResults) {
        clearLastSearchQuery();
      } else {
        handleNoSearchResults(searchString);
      }
    }
  }, [
    isFetching,
    filterState.isFilterChangeInProgress,
    resetFilterProgress,
    courseData,
    searchString,
    savePreviousCourseData,
    clearLastSearchQuery,
    handleNoSearchResults,
  ]);

  return {
    pageIndex,
    filterState,
    handleFetchData,
    resetFilterProgress,
    searchString,
    lastSearchQuery,
    previousCourseData,
    handleSearch,
    handleClearSearch,
    savePreviousCourseData,
    handleNoSearchResults,
    clearLastSearchQuery,
  };
};
