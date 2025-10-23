import { useState, useCallback } from 'react';

import { DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';

/**
 * Custom hook for managing pagination state in the DataTable.
 *
 * This hook provides functionality to:
 * - Track current page index
 * - Handle page changes
 * - Reset pagination to the first page
 */
export const usePagination = () => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX);

  const handlePageChange = useCallback((newPageIndex: number) => {
    setPageIndex(newPageIndex);
  }, []);

  const resetPagination = useCallback(() => {
    setPageIndex(DEFAULT_PAGE_INDEX);
  }, []);

  return {
    pageIndex,
    handlePageChange,
    resetPagination,
  };
};
