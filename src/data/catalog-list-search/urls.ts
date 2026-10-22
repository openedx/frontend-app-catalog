import { getSiteConfig } from '@openedx/frontend-base';

export const getApiBaseUrl = () => getSiteConfig().lmsBaseUrl;

export const getCourseListSearchUrl = () => `${getApiBaseUrl()}/search/unstable/v0/course_list_search/`;
