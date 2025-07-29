import { getConfig } from '@edx/frontend-platform';

/**
 * Generates the full API URL for fetching a course's "About" page data.
 * @param {string} courseId The identifier of the course (e.g., 'course-v1:Org+Course+Run').
 * @returns {string} The full API URL to fetch the course's about data.
 */
export const getCourseAboutDataUrl = (
  courseId: string,
) => `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`;

/**
 * Generates the full URL for the page where a user can change their enrollment status.
 * @returns {string} The full URL for the change enrollment page.
 */
export const getChangeEnrollmentUrl = () => `${getConfig().LMS_BASE_URL}/change_enrollment`;
