import { getAppConfig } from '@openedx/frontend-base';

import { appId } from '@src/constants';

/**
 * Returns the absolute URL to the learning home page for a given course.
 */
export const getLearningHomePageUrl = (courseId: string) => `${getAppConfig(appId).LEARNING_BASE_URL as string}/course/${courseId}/home`;
