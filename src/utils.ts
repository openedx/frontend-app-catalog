import { getConfig } from '@edx/frontend-platform';

/**
 * Gets the base URL for the LMS from the frontend platform configuration.
 */
export const getBaseUrl = () => getConfig().LMS_BASE_URL;

/**
 * Resolves a URL by combining it with a base URL if it's relative.
 * If the URL is null or absolute (starts with http:// or https://), it is returned as is.
 */
export const resolveUrl = (base: string, url: string) => ((url == null || url.startsWith('http://') || url.startsWith('https://')) ? url : `${base}${url}`);

/**
 * Creates a full URL by combining the LMS base URL with a relative path.
 */
export const baseAppUrl = (url: string) => resolveUrl(getBaseUrl(), url);

/**
 * Gets the URL for the programs dashboard page.
 */
export const programsUrl = () => baseAppUrl('/dashboard/programs');
