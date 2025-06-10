import { getConfig } from '@edx/frontend-platform';

export const getApiBaseUrl = () => getConfig().LMS_BASE_URL;

export const COURSE_DISCOVERY_URL = `${getApiBaseUrl()}/search/course_discovery/`;

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_INDEX = 0;
