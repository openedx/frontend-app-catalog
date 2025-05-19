import { getConfig } from '@edx/frontend-platform';

// TODO: Remove `undefined` after adding an organization image.
export const getFullImageUrl = (path: string | undefined) => `${getConfig().LMS_BASE_URL}${path}`;
