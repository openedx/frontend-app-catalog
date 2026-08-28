import { getAppConfig } from '@openedx/frontend-base';

import { appId } from '@src/constants';

/**
 * Returns the absolute URL to the learning home page for a given course, or
 * `null` when the site has no `LEARNING_BASE_URL` configured.
 */
export const getLearningHomePageUrl = (courseId: string) => {
  const learningBaseUrl = getAppConfig(appId).LEARNING_BASE_URL;
  return typeof learningBaseUrl === 'string' && learningBaseUrl
    ? `${learningBaseUrl}/course/${courseId}/home`
    : null;
};
