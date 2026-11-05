import { camelCaseObject, getAppConfig } from '@openedx/frontend-base';
import { getAuthenticatedHttpClient } from '@openedx/frontend-base';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import { getCourseListSearchUrl } from './urls';
import { addFiltersToFormData } from './utils';

import type { CourseListSearchResponse } from './types';
import { appId } from '@src/constants';

/**
 * Coerces a pagination value into an integer the search API can parse.
 */
const toPaginationValue = (value: unknown, fallback: number, minimum: number): number => {
  if (typeof value === 'number' && Number.isInteger(value) && value >= minimum) {
    return value;
  }

  return fallback;
};

/**
 * Fetches course list search data from the API.
 * @async
 */
export const fetchCourseListSearch = async (params): Promise<CourseListSearchResponse> => {
  const {
    filters = {},
    searchString = '',
  } = params;

  const pageSize = toPaginationValue(params.pageSize, DEFAULT_PAGE_SIZE, 1);
  const pageIndex = toPaginationValue(params.pageIndex, DEFAULT_PAGE_INDEX, 0);
  // Only respect sorting by start date if there is no search string.
  // With a search string, it should be sorted by relevance instead.
  const sortByStartDate: boolean = !searchString && getAppConfig(appId).ENABLE_COURSE_SORTING_BY_START_DATE === true;

  const formData = new FormData();

  formData.append('page_size', String(pageSize));
  formData.append('page_index', String(pageIndex));
  formData.append('enable_course_sorting_by_start_date', String(sortByStartDate));

  if (searchString) {
    formData.append('search_string', searchString);
  }

  addFiltersToFormData(formData, filters);

  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseListSearchUrl(), formData);

  return camelCaseObject(data);
};
