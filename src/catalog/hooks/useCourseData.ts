import { useState, useCallback, useEffect } from 'react';

import type { CourseListSearchResponse } from '@src/data/course-list-search/types';

/**
 * Custom hook for managing course data caching and search result handling.
 *
 * This hook provides functionality to:
 * - Cache previous course data when not searching
 * - Handle search result states (successful results vs no results)
 * - Manage data persistence for better UX
 * - Coordinate with search state management
 */
export const useCourseData = (
  courseData: CourseListSearchResponse | undefined,
  searchString: string,
  isFetching: boolean,
  onNoSearchResults: (searchQuery: string) => void,
  onClearLastSearchQuery: () => void,
) => {
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
   * Handles course data state changes and search result processing.
   */
  useEffect(() => {
    if (!courseData) { return; }

    if (!searchString) {
      savePreviousCourseData(courseData);
      return;
    }

    const hasResults = (courseData.results?.length ?? 0) > 0;

    if (!isFetching) {
      if (hasResults) {
        onClearLastSearchQuery();
      } else {
        onNoSearchResults(searchString);
      }
    }
  }, [
    courseData,
    searchString,
    isFetching,
    savePreviousCourseData,
    onNoSearchResults,
    onClearLastSearchQuery,
  ]);

  return {
    previousCourseData,
    savePreviousCourseData,
  };
};
