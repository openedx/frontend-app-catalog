import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';
import type { UseSearchProps } from './types';

/**
 * Custom hook for managing search functionality in the catalog.
 *
 * This hook provides functionality to:
 * - Handle search queries
 * - Manage search state
 * - Initialize search from URL parameters
 */
export const useSearch = ({ fetchData, courseData, isFetching }: UseSearchProps) => {
  const [searchString, setSearchString] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [hasInitialized, setHasInitialized] = useState(false);

  const urlSearchQuery = searchParams.get('search_query');

  /**
   * Handles search operations to ensure proper state management and API calls.
   */
  const handleSearch = useCallback((query: string) => {
    setSearchString(query);

    if (urlSearchQuery) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('search_query');
      setSearchParams(newParams);
    }

    fetchData({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: query,
    });
  }, [fetchData, setSearchParams, searchParams, urlSearchQuery]);

  /**
   * Initializes search state from URL parameters on component mount.
   */
  useEffect(() => {
    if (hasInitialized) {
      return;
    }

    if (!courseData || isFetching) {
      return;
    }

    if (urlSearchQuery && !searchString) {
      setSearchString(urlSearchQuery);

      fetchData({
        pageIndex: DEFAULT_PAGE_INDEX,
        pageSize: DEFAULT_PAGE_SIZE,
        filters: [],
        searchString: urlSearchQuery,
      });
    }

    setHasInitialized(true);
  }, [hasInitialized, urlSearchQuery, searchString, fetchData, courseData, isFetching]);

  return {
    searchString,
    handleSearch,
  };
};
