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
): Promise<CourseDiscoveryResponse> => {
  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseDiscoveryUrl(), {
      page_size: pageSize,
      page_index: pageIndex,
    });

  return camelCaseObject(data);
};
