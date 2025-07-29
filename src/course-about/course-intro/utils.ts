import { getConfig } from '@edx/frontend-platform';

/**
 * Returns the absolute URL to the learning home page for a given course.
 */
export const getLearningHomePageUrl = (courseId: string) => `${getConfig().LEARNING_BASE_URL}/learning/course/${courseId}/home`;
