import { useQuery } from '@tanstack/react-query';

import { fetchCourseDiscovery } from './api';
import { CourseDiscoveryResponse } from './types';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from './constants';

/**
 * A React Query hook that fetches course discovery data.
 */
export const useCourseDiscovery = ({
  pageSize,
  pageIndex,
  enableCourseSortingByStartDate,
} = {
  pageSize: DEFAULT_PAGE_SIZE,
  pageIndex: DEFAULT_PAGE_INDEX,
  enableCourseSortingByStartDate: false,
}) => useQuery<CourseDiscoveryResponse, Error>({
  queryKey: ['courseDiscovery'],
  queryFn: () => fetchCourseDiscovery(
    pageSize,
    pageIndex,
    enableCourseSortingByStartDate,
  ),
});
