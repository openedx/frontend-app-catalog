import { getConfig } from '@edx/frontend-platform';

import { AuthenticatedUserTypes } from './types';

/**
 * Determines the logo destination URL based on the current page and user authentication status.
 *
 * @param isNotHomePage - Whether the current page is not the home page
 * @param authenticatedUser - The authenticated user object or null/undefined for non-authenticated users
 * @returns The destination URL for the logo link, or undefined if on a non-home page
 */
export const getLogoDestination = (isNotHomePage: boolean, authenticatedUser: AuthenticatedUserTypes) => {
  if (isNotHomePage) {
    return undefined;
  }

  if (authenticatedUser) {
    return `/${process.env.APP_ID}/`;
  }

  return getConfig().LMS_BASE_URL;
};
