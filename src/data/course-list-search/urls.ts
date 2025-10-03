import { getConfig } from '@edx/frontend-platform';

export const getApiBaseUrl = () => getConfig().LMS_BASE_URL;

export const getCourseListSearchUrl = () => `${getApiBaseUrl()}/search/unstable/v0/course_list_search/`;
