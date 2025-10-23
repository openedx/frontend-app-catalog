import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';
import { DataTableParams } from '@src/data/course-list-search/types';

/**
 * Custom hook for managing search functionality in the catalog.
 *
 * This hook provides functionality to:
 * - Handle search queries and URL synchronization
 * - Manage search state and history
 * - Initialize search from URL parameters
 * - Handle search result states (no results, clearing search)
 */
export const useSearch = (fetchData: (params: DataTableParams) => void) => {
  const [searchString, setSearchString] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [hasInitialized, setHasInitialized] = useState(false);

  const urlSearchQuery = searchParams.get('search_query');

  /**
   * Handles search operations to ensure proper state management and API calls.
   */
  const handleSearch = useCallback((query: string) => {
    setSearchString(query);
    setLastSearchQuery(query ? '' : lastSearchQuery);
    setSearchParams(query ? { search_query: query } : {});

    fetchData({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: query,
    });
  }, [fetchData, setSearchParams, lastSearchQuery]);

  /**
   * Clears the current search and resets to the default DataTable view.
   */
  const handleClearSearch = useCallback(() => {
    setSearchString('');
    setLastSearchQuery('');
    setSearchParams({});

    fetchData({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
    });
  }, [fetchData, setSearchParams]);

  /**
   * Handles the case when a search returns no results.
   * This is typically called when the search API returns empty results.
   */
  const handleNoSearchResults = useCallback((searchQuery: string) => {
    setLastSearchQuery(searchQuery);
    setSearchString('');
    setSearchParams({});
  }, [setSearchParams]);

  /**
   * Clears the last search query when no results are found.
   */
  const clearLastSearchQuery = useCallback(() => {
    setLastSearchQuery('');
  }, []);

  /**
   * Initializes search state from URL parameters on component mount.
   */
  useEffect(() => {
    if (hasInitialized) { return; }

    if (urlSearchQuery && !searchString) {
      handleSearch(urlSearchQuery);
    } else if (!urlSearchQuery && !searchString) {
      fetchData({ pageIndex: DEFAULT_PAGE_INDEX, pageSize: DEFAULT_PAGE_SIZE, filters: [] });
    }

    setHasInitialized(true);
  }, [hasInitialized, urlSearchQuery, searchString, handleSearch, fetchData]);

  return {
    searchString,
    lastSearchQuery,
    handleSearch,
    handleClearSearch,
    handleNoSearchResults,
    clearLastSearchQuery,
  };
};
