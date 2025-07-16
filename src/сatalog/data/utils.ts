import { DataTableFilter, type CourseDiscoveryParams, type DataTableParams } from './types';

/**
 * Appends filters to the FormData object for backend requests.
 *
 * @param {FormData} formData - The FormData object to which filters will be appended.
 * @param {Record<string, string[]>} filters - An object where the key
 * is the filter name and the value is an array of filter values.
 */
export const addFiltersToFormData = (formData: FormData, filters: Record<string, string[]>) => {
  if (!filters || typeof filters !== 'object') {
    return;
  }

  Object.entries(filters).forEach(([key, values]) => {
    if (Array.isArray(values)) {
      values.forEach(value => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });
    } else if (values !== undefined && values !== null && values !== '') {
      formData.append(key, values);
    }
  });
};

/**
 * Transforms DataTable filters array into a Record<string, string[]> for API.
 */
export const transformDataTableFilters = (
  filters?: Array<DataTableFilter>,
): Record<string, string[]> => {
  const transformedFilters: Record<string, string[]> = {};
  if (!filters) {
    return transformedFilters;
  }

  const groupedFilters: Record<string, Set<string>> = {};

  filters.forEach((filter) => {
    if (!groupedFilters[filter.id]) {
      groupedFilters[filter.id] = new Set();
    }
    if (Array.isArray(filter.value)) {
      filter.value.forEach(value => {
        if (value !== undefined && value !== null && value !== '') {
          groupedFilters[filter.id].add(value);
        }
      });
    } else if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
      groupedFilters[filter.id].add(filter.value);
    }
  });

  Object.entries(groupedFilters).forEach(([key, valuesSet]) => {
    transformedFilters[key] = Array.from(valuesSet);
  });

  return transformedFilters;
};

/**
 * Creates a function that fetches data from the API.
 */
export const createFetchData = (
  setParams: (params: CourseDiscoveryParams) => void,
  paramsRef: { current: CourseDiscoveryParams },
) => (newParams: DataTableParams) => {
  const transformedFilters = transformDataTableFilters(newParams.filters);

  const transformedParams: CourseDiscoveryParams = {
    pageSize: newParams.pageSize,
    // pageIndex: newParams.pageIndex,
    pageIndex: Object.keys(transformedFilters).length > 0 ? 0 : newParams.pageIndex,
    filters: transformedFilters,
  };

  const currentParams = paramsRef.current;
  const hasChanged = JSON.stringify(currentParams) !== JSON.stringify(transformedParams);

  if (hasChanged) {
    setParams(transformedParams);
  }
};
