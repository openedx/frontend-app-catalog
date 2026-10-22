import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { fetchCatalogListSearch } from './api';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import type {
  CatalogListSearchMixedResponse, CourseListSearchParams, CatalogListSearchHook, DataTableParams,
} from './types';
import { transformDataTableFilters } from './utils';

/**
 * A React Query hook that fetches catalog list search data.
 */
export const useCatalogListSearch = ({
  pageSize = DEFAULT_PAGE_SIZE,
  pageIndex = DEFAULT_PAGE_INDEX,
  enableCourseSortingByStartDate = false,
  filters = {},
  searchString = '',
}: Partial<CourseListSearchParams> = {}): CatalogListSearchHook => {
  const [params, setParams] = useState<CourseListSearchParams>({
    pageSize,
    pageIndex,
    enableCourseSortingByStartDate,
    filters,
    searchString,
  });

  const {
    data, isLoading, isError, error, isFetching,
  } = useQuery<CatalogListSearchMixedResponse, Error>({
    queryKey: ['catalogListSearch', params],
    queryFn: () => fetchCatalogListSearch(params),
    placeholderData: (previousData) => previousData,
  });

  /**
   * Updates query params and triggers data refetch if params have changed.
   */
  const fetchData = useCallback((newParams: DataTableParams & { searchString?: string }) => {
    const transformedFilters = transformDataTableFilters(newParams.filters);

    setParams(prevParams => {
      const transformedParams: CourseListSearchParams = {
        pageSize: newParams.pageSize,
        pageIndex: newParams.pageIndex,
        enableCourseSortingByStartDate: prevParams.enableCourseSortingByStartDate,
        filters: transformedFilters,
        searchString: newParams.searchString || '',
      };

      const hasChanged = JSON.stringify(prevParams) !== JSON.stringify(transformedParams);
      return hasChanged ? transformedParams : prevParams;
    });
  }, []);

  return {
    data,
    isLoading,
    isError,
    error,
    fetchData,
    isFetching,
  };
};
