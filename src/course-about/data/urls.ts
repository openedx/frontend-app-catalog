import { getConfig } from '@edx/frontend-platform';

export const getApiBaseUrl = () => getConfig().LMS_BASE_URL;

export const getCourseAboutDataUrl = (courseId: string) => `${getApiBaseUrl()}/api/courseware/course/${courseId}`;

export const getChangeEnrollmentUrl = () => `${getApiBaseUrl()}/change_enrollment`;
