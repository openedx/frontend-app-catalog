import { getAppConfig } from '@openedx/frontend-base';

import { appId } from './constants';

/**
 * Reads a string setting out of the app config, falling back when the key is
 * absent or holds a non-string value.
 */
export const getStringConfig = (key: string, fallback = ''): string => {
  const value = getAppConfig(appId)[key];
  return typeof value === 'string' ? value : fallback;
};
