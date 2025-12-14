import { useState, useCallback, useEffect } from 'react';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';
import type { UseSearchProps } from './types';

/**
 * Custom hook for managing search functionality in the catalog.
 *
 * This hook provides functionality to:
 * - Handle search queries and synchronize them with URL parameters
 * - Manage search state (current query and URL query)
 * - Initialize search from URL parameters on component mount
 * - Track initialization state to prevent duplicate API calls
 */
export const useSearch = ({
  fetchData, isFetching, searchParams, setSearchParams,
}: UseSearchProps) => {
  const [searchString, setSearchString] = useState('');

  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false);

  const urlSearchQuery = searchParams.get('search_query') || '';

  /**
   * Handles search operations to ensure proper state management and API calls.
   */
  const handleSearch = useCallback((query: string) => {
    setSearchString(query);

    const newParams = new URLSearchParams(searchParams.toString());
    if (query) {
      newParams.set('search_query', query);
    } else {
      newParams.delete('search_query');
    }
    setSearchParams(newParams, { replace: true });

    fetchData({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: query,
    });
  }, [fetchData, searchParams, setSearchParams]);

  /**
   * Initializes search state from URL parameters on component mount.
   */
  useEffect(() => {
    if (hasInitializedFromUrl) {
      return;
    }

    if (urlSearchQuery && !searchString) {
      setSearchString(urlSearchQuery);
      if (!isFetching) {
        fetchData({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: DEFAULT_PAGE_SIZE,
          filters: [],
          searchString: urlSearchQuery,
        });
      }
    }
    setHasInitializedFromUrl(true);
  }, [urlSearchQuery, hasInitializedFromUrl, isFetching, fetchData, searchString]);

  return {
    hasInitializedFromUrl,
    urlSearchQuery,
    searchString,
    handleSearch,
  };
};
