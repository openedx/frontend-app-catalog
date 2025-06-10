import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import { getCourseDiscoveryUrl } from './urls';

import { CourseDiscoveryResponse } from './types';

/**
 * Fetches course discovery data from the API.
 * @async
 */
export const fetchCourseDiscovery = async (
  pageSize = DEFAULT_PAGE_SIZE,
  pageIndex = DEFAULT_PAGE_INDEX,
  enableCourseSortingByStartDate = false,
): Promise<CourseDiscoveryResponse> => {
  const formData = new FormData();
  formData.append('page_size', String(pageSize));
  formData.append('page_index', String(pageIndex));
  formData.append('enable_course_sorting_by_start_date', String(enableCourseSortingByStartDate));

  const { data } = await getAuthenticatedHttpClient().post(
    getCourseDiscoveryUrl(),
    formData,
  );

  return camelCaseObject(data);
};
