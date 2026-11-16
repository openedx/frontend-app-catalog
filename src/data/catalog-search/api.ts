import { camelCaseObject } from '@openedx/frontend-base';
import { getAuthenticatedHttpClient } from '@openedx/frontend-base';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import { getCatalogSearchUrl } from './urls';
import { addFiltersToFormData } from './utils';

import type { CatalogSearchResponse } from './types';

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
 * Fetches catalog search data from the API.
 * @async
 */
export const fetchCatalogSearch = async (params): Promise<CatalogSearchResponse> => {
  const {
    enableCourseSortingByStartDate = false,
    filters = {},
    searchString = '',
  } = params;

  const pageSize = toPaginationValue(params.pageSize, DEFAULT_PAGE_SIZE, 1);
  const pageIndex = toPaginationValue(params.pageIndex, DEFAULT_PAGE_INDEX, 0);

  const formData = new FormData();

  formData.append('page_size', String(pageSize));
  formData.append('page_index', String(pageIndex));
  formData.append('enable_course_sorting_by_start_date', String(enableCourseSortingByStartDate));

  if (searchString) {
    formData.append('search_string', searchString);
  }

  addFiltersToFormData(formData, filters);

  const { data } = await getAuthenticatedHttpClient()
    .post(getCatalogSearchUrl(), formData);

  return camelCaseObject(data);
};
