import { camelCaseObject, getAuthenticatedHttpClient } from '@openedx/frontend-base';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import { getCatalogSearchUrl } from './urls';
import { addFiltersToFormData } from './utils';

import type { CatalogSearchParams, CatalogSearchResponse } from './types';

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
 * Normalizes a catalog search response to camelCase, except the dynamic
 * keys under aggregation `terms` and `labels` maps. Those keys are backend
 * slugs (e.g. `professional-certificate`) and their display labels, which are
 * sent back verbatim as filter values — camelCasing them would break filtering
 * and the labels lookup.
 */
const normalizeCatalogSearchResponse = (data: any): CatalogSearchResponse => {
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
 * Fetches catalog search data from the API.
 */
export const fetchCatalogSearch = async (
  params: CatalogSearchParams,
): Promise<CatalogSearchResponse> => {
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

  return normalizeCatalogSearchResponse(data);
};
