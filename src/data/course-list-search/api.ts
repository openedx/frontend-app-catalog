import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import { getCourseListSearchUrl } from './urls';
import { addFiltersToFormData } from './utils';

import type { CourseListSearchResponse } from './types';

/**
 * Fetches course list search data from the API.
 * @async
 */
export const fetchCourseListSearch = async (params): Promise<CourseListSearchResponse> => {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    pageIndex = DEFAULT_PAGE_INDEX,
    enableCourseSortingByStartDate = false,
    filters = {},
    searchString = '',
  } = params;

  const formData = new FormData();

  formData.append('page_size', String(pageSize));
  formData.append('page_index', String(pageIndex));
  formData.append('enable_course_sorting_by_start_date', String(enableCourseSortingByStartDate));

  if (searchString) {
    formData.append('search_string', searchString);
  }

  addFiltersToFormData(formData, filters);

  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseListSearchUrl(), formData);

  return camelCaseObject(data);
};
