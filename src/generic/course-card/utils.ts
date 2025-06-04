import { getConfig } from '@edx/frontend-platform';

// TODO: Remove `undefined` after adding an organization image.
export const getFullImageUrl = (path: string | undefined) => {
  if (!path) {
    return '';
  }
  return `${getConfig().LMS_BASE_URL}${path}`;
};
