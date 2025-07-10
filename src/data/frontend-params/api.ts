import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { FrontendParamsResponse } from './types';
import { getFrontendParamsUrl } from './urls';

/**
 * Fetches frontend parameters data from the API endpoint.
 *
 * @returns {Promise<FrontendParamsResponse>} A promise that resolves to the camelCased frontend parameters response.
 */
export const fetchFrontendParams = async (): Promise<FrontendParamsResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(getFrontendParamsUrl());

  return camelCaseObject(data);
};
