import { useQuery } from '@tanstack/react-query';

import { fetchCourseDiscovery } from './api';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import { CourseDiscoveryResponse } from './types';

/**
 * A React Query hook that fetches course discovery data.
 */
export const useCourseDiscovery = () => useQuery<CourseDiscoveryResponse, Error>({
  queryKey: ['courseDiscovery'],
  queryFn: () => fetchCourseDiscovery(DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX),
});
