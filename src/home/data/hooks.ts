import { useQuery } from '@tanstack/react-query';

import { HomeSettingsResponse } from './types';
import { fetchHomeSettings } from './api';

/**
 * React Query hook for fetching home page settings data.
 *
 * This hook retrieves home page configuration from the backend
 * using an authenticated request and caches the result under the 'homeSettings' query key.
 *
 * @returns {UseQueryResult<HomeSettingsResponse, Error>} The query result including data, status, and error if any.
 */
export const useHomeSettingsQuery = () => useQuery<HomeSettingsResponse, Error>({
  queryKey: ['homeSettings'],
  queryFn: () => fetchHomeSettings(),
});
