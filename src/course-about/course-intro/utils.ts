import { getStringConfig } from '@src/config';

/**
 * Returns the absolute URL to the learning home page for a given course, or
 * `null` when the site has no `LEARNING_BASE_URL` configured.
 */
export const getLearningHomePageUrl = (courseId: string) => {
  const learningBaseUrl = getStringConfig('LEARNING_BASE_URL');
  return learningBaseUrl ? `${learningBaseUrl}/course/${courseId}/home` : null;
};
