import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchFrontendParams } from './api';
import { FrontendParamsResponse } from './types';

/**
 * React Query hook for fetching frontend parameters data.
 *
 * This hook retrieves frontend configuration from the backend
 * using an authenticated request and caches the result under the 'frontendParams' query key.
 *
 * @returns {UseQueryResult<FrontendParamsResponse, Error>} The query result including data, status, and error if any.
 */
export const useFrontendParamsQuery = () => useQuery<FrontendParamsResponse, Error>({
  queryKey: ['frontendParams'],
  queryFn: () => fetchFrontendParams(),
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
});

/**
 * React Query hook for prefetching frontend parameters data.
 * This can be used to preload the data before it's needed.
 */
export const usePrefetchFrontendParams = () => {
  const queryClient = useQueryClient();

  return () => queryClient.prefetchQuery({
    queryKey: ['frontendParams'],
    queryFn: () => fetchFrontendParams(),
  });
};
