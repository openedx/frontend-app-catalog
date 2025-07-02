import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { HomeSettingsResponse } from './types';
import { getHomeSettingsUrl } from './urls';

/**
 * Fetches home page settings data from the API endpoint.
 *
 * @returns {Promise<HomeSettingsResponse>} A promise that resolves to the camelCased home page settings response.
 */
export const fetchHomeSettings = async (): Promise<HomeSettingsResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(getHomeSettingsUrl());

  return camelCaseObject(data);
};
