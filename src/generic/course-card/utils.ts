import { getConfig } from '@edx/frontend-platform';

/**
 * Constructs a full URL for an image by combining the LMS base URL with the provided image path.
 */
export const getFullImageUrl = (path?: string) => {
  if (!path) {
    return '';
  }
  return `${getConfig().LMS_BASE_URL}${path}`;
};
