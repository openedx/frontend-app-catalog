import { getConfig } from '@edx/frontend-platform';

export const getApiBaseUrl = () => getConfig().LMS_BASE_URL;

export const getCourseDiscoveryUrl = () => `${getApiBaseUrl()}/search/v1/course_discovery/`;
