import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { HomeSettingsResponse } from './types';
import { getHomeSettingsUrl } from './urls';

/**
 * Fetches Home settiongs from the API.
 * @async
 */
export const fetchHomeSettings = async (): Promise<HomeSettingsResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(getHomeSettingsUrl());

  return camelCaseObject(data);
};
