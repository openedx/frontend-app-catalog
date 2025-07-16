import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from '../constants';
import { fetchCourseDiscovery } from './api';
import {
  CourseDiscoveryResponse, CourseDiscoveryParams, CourseDiscoveryHook,
} from './types';
import { createFetchData } from './utils';

/**
 * Custom hook for fetching and managing course discovery data.
 * Handles backend filtering, pagination, and sorting.
 */
export const useCourseDiscovery = (): CourseDiscoveryHook => {
  const [params, setParams] = useState<CourseDiscoveryParams>({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: DEFAULT_PAGE_INDEX,
    filters: {},
  });

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const {
    data, isLoading, isError, error, isFetching,
  } = useQuery<CourseDiscoveryResponse, Error>({
    queryKey: ['courseDiscovery', params],
    queryFn: () => fetchCourseDiscovery(params),
    placeholderData: (previousData) => previousData,
  });

  /**
   * Updates query params and triggers data refetch if params have changed.
   */
  const fetchData = useCallback(createFetchData(setParams, paramsRef), []);

  return {
    data,
    isLoading,
    isError,
    error,
    fetchData,
    isFetching,
  };
};
