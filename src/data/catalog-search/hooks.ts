import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { fetchCatalogSearch } from './api';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import type {
  CatalogSearchResponse, CatalogSearchParams, CatalogSearchHook, DataTableParams,
} from './types';
import { transformDataTableFilters } from './utils';

/**
 * A React Query hook that fetches catalog search data.
 */
export const useCatalogSearch = ({
  pageSize = DEFAULT_PAGE_SIZE,
  pageIndex = DEFAULT_PAGE_INDEX,
  enableCourseSortingByStartDate = false,
  filters = {},
  searchString = '',
}: Partial<CatalogSearchParams> = {}): CatalogSearchHook => {
  const [params, setParams] = useState<CatalogSearchParams>({
    pageSize,
    pageIndex,
    enableCourseSortingByStartDate,
    filters,
    searchString,
  });

  const {
    data, isLoading, isError, error, isFetching,
  } = useQuery<CatalogSearchResponse, Error>({
    queryKey: ['catalogSearch', params],
    queryFn: () => fetchCatalogSearch(params),
    placeholderData: (previousData) => previousData,
  });

  /**
   * Updates query params and triggers data refetch if params have changed.
   */
  const fetchData = useCallback((newParams: DataTableParams & { searchString?: string }) => {
    const transformedFilters = transformDataTableFilters(newParams.filters);

    setParams(prevParams => {
      const transformedParams: CatalogSearchParams = {
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
