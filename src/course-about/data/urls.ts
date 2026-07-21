import { getSiteConfig } from '@openedx/frontend-base';

/**
 * Generates the full API URL for fetching a course's "About" page data.
 */
export const getCourseAboutDataUrl = (
  courseId: string,
) => `${getSiteConfig().lmsBaseUrl}/api/courseware/course/${courseId}`;

/**
 * Generates the full URL for the page where a user can change their enrollment status.
 */
export const getChangeEnrollmentUrl = () => `${getSiteConfig().lmsBaseUrl}/change_enrollment`;
