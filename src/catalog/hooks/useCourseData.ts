import { useState, useCallback, useEffect } from 'react';

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
   * Saves course data to cache when not actively searching.
   */
  const savePreviousCourseData = useCallback((data: CourseListSearchResponse) => {
    if (data && !searchString) {
      setPreviousCourseData(data);
    }
  }, [searchString]);

  /**
   * Handles course data state changes.
   */
  useEffect(() => {
    if (!courseData) {
      return;
    }

    if (!searchString) {
      savePreviousCourseData(courseData);
    }
  }, [courseData, searchString, savePreviousCourseData]);

  return {
    previousCourseData,
    savePreviousCourseData,
  };
};
