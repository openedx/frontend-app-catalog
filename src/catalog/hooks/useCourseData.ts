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
  catalogData,
  searchString,
}: UseCourseDataProps) => {
  const [previousCatalogData, setPreviousCatalogData] = useState<CourseListSearchResponse | null>(null);

  /**
   * Handles course data state changes.
   */
  useEffect(() => {
    if (catalogData && !searchString && catalogData.total > 0) {
      setPreviousCatalogData(catalogData);
    }
  }, [catalogData, searchString]);

  return { previousCatalogData };
};
