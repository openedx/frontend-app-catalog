import { useQuery } from '@tanstack/react-query';

import { fetchCourseListSearch } from './api';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import { CourseListSearchResponse } from './types';

/**
 * A React Query hook that fetches course list search data.
 */
export const useCourseListSearch = ({
  pageSize,
  pageIndex,
  enableCourseSortingByStartDate,
} = {
  pageSize: DEFAULT_PAGE_SIZE,
  pageIndex: DEFAULT_PAGE_INDEX,
  enableCourseSortingByStartDate: false,
}) => useQuery<CourseListSearchResponse, Error>({
  queryKey: ['courseListSearch'],
  queryFn: () => fetchCourseListSearch(
    pageSize,
    pageIndex,
    enableCourseSortingByStartDate,
  ),
});
