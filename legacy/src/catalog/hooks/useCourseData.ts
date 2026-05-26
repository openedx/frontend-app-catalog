import { useState, useEffect } from 'react';

import type { CourseListSearchResponse } from '@src/data/course-list-search/types';
import type { UseCourseDataProps } from './types';

/**
 * Custom hook for managing course data caching.
 *
 * This hook provides functionality to:
 * - Cache previous course data when not searching
 * - Manage data persistence for better UX
 */
export const useCourseData = ({
  courseData,
  searchString,
}: UseCourseDataProps) => {
  const [previousCourseData, setPreviousCourseData] = useState<CourseListSearchResponse | null>(null);

  /**
   * Handles course data state changes.
   */
  useEffect(() => {
    if (courseData && !searchString && courseData.total > 0) {
      setPreviousCourseData(courseData);
    }
  }, [courseData, searchString]);

  return { previousCourseData };
};
