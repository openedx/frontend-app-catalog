import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from '../constants';
import { getCourseDiscoveryUrl } from './urls';
import { addFiltersToFormData } from './utils';

import { CourseDiscoveryResponse, CourseDiscoveryParams } from './types';

/**
 * Fetches course discovery data from the API with filtering and sorting.
 */
export const fetchCourseDiscovery = async (
  params: CourseDiscoveryParams = {},
): Promise<CourseDiscoveryResponse> => {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    pageIndex = DEFAULT_PAGE_INDEX,
    filters = {},
  } = params;

  const formData = new FormData();

  formData.append('page_size', String(pageSize));
  formData.append('page_index', String(pageIndex));

  addFiltersToFormData(formData, filters);

  const { data } = await getAuthenticatedHttpClient().post(
    getCourseDiscoveryUrl(),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  if (!data || typeof data !== 'object') {
    return logError('Invalid response from course discovery API', { data });
  }

  return camelCaseObject(data);
};
