import { getAppConfig, camelCaseObject } from '@openedx/frontend-base';
import { getAuthenticatedHttpClient } from '@openedx/frontend-base';

import { appId } from '@src/constants';

import { mockCatalogListSearchResponse } from '../../__mocks__';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from './constants';
import { getCourseListSearchUrl } from './urls';
import { addFiltersToFormData } from './utils';

import type { CatalogListSearchMixedResponse } from './types';

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
 * Fetches catalog list search data from the API.
 * @async
 */
export const fetchCatalogListSearch = async (
  params,
): Promise<CatalogListSearchMixedResponse> => {
  // istanbul ignore if
  if (getAppConfig(appId).ENABLE_PATHWAY_PILOT_UI === true) {
    return mockCatalogListSearchResponse;
  }

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
    .post(getCourseListSearchUrl(), formData);

  return normalizeCatalogListSearchResponse(data);
};
