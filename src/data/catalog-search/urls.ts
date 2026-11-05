import { getSiteConfig } from '@openedx/frontend-base';

export const getApiBaseUrl = () => getSiteConfig().lmsBaseUrl;

/**
 * The legacy course-only search endpoint. ADR 0003 adds a generic
 * `catalog_search` endpoint; the URL switches there once it is available.
 */
export const getCatalogSearchUrl = () => `${getApiBaseUrl()}/search/unstable/v0/course_list_search/`;
