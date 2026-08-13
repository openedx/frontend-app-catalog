import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import { getCourseListSearchUrl } from './urls';
import { addFiltersToFormData } from './utils';

import type { CatalogListSearchMixedResponse } from './types';

/**
 * Normalizes a catalog list search response to camelCase, except the dynamic
 * keys under aggregation `terms` and `labels` maps. Those keys are backend
 * slugs (e.g. `professional-certificate`) and their display labels, which are
 * sent back verbatim as filter values — camelCasing them would break filtering
 * and the labels lookup.
 */
const normalizeCatalogListSearchResponse = (data: any): CatalogListSearchMixedResponse => {
  const { aggs, ...rest } = data;
  const normalized = camelCaseObject(rest);

  if (aggs) {
    normalized.aggs = Object.fromEntries(
      Object.entries(aggs as Record<string, any>).map(([facetName, facet]) => [
        facetName,
        {
          ...camelCaseObject(facet),
          // Preserve dynamic slug/label keys exactly.
          terms: facet.terms,
          ...(facet.labels ? { labels: facet.labels } : {}),
        },
      ]),
    );
  }

  return normalized;
};

/**
 * Fetches course list search data from the API.
 * @async
 */
export const fetchCourseListSearch = async (
  params,
): Promise<CatalogListSearchMixedResponse> => {
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

  return normalizeCatalogListSearchResponse(data);
};
