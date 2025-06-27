import type { TransformedCourseItem } from './types';
import type { CourseDiscoveryResponse } from './data/types';

/**
 * Transforms course discovery results into a format suitable for DataTable display.
 */
export const transformResultsForTable = (results: CourseDiscoveryResponse['results'] | undefined): TransformedCourseItem[] => {
  if (!results?.length) {
    return [];
  }

  return results.map(item => ({
    id: item.id,
    famous_for: item.data.content.displayName,
    language: item.data.language,
    modes: item.data.modes,
    org: item.data.org,
    data: item.data,
    index: item.index,
    type: item.type,
  }));
};
