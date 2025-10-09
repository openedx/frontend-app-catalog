import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { fetchCourseListSearch } from './api';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import type {
  CourseListSearchResponse, CourseListSearchParams, CourseListSearchHook, DataTableParams,
} from './types';
import { transformDataTableFilters } from './utils';

/**
 * A React Query hook that fetches course list search data.
 */
export const useCourseListSearch = ({
  pageSize = DEFAULT_PAGE_SIZE,
  pageIndex = DEFAULT_PAGE_INDEX,
  enableCourseSortingByStartDate = false,
  filters = {},
}: Partial<CourseListSearchParams> = {}): CourseListSearchHook => {
  const [params, setParams] = useState<CourseListSearchParams>({
    pageSize,
    pageIndex,
    enableCourseSortingByStartDate,
    filters,
  });

  const {
    data, isLoading, isError, error, isFetching,
  } = useQuery<CourseListSearchResponse, Error>({
    queryKey: ['courseListSearch', params],
    queryFn: () => fetchCourseListSearch(params),
    placeholderData: (previousData) => previousData,
  });

  /**
   * Updates query params and triggers data refetch if params have changed.
   */
  const fetchData = useCallback((newParams: DataTableParams) => {
    const transformedFilters = transformDataTableFilters(newParams.filters);

    const transformedParams: CourseListSearchParams = {
      pageSize: newParams.pageSize,
      pageIndex: newParams.pageIndex,
      filters: transformedFilters,
    };

    setParams(prevParams => {
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
