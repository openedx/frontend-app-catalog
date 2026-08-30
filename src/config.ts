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

/**
 * Reads a count setting out of the app config, falling back when the key is
 * absent or holds anything that does not read as a whole number.
 */
export const getCountConfig = (key: string, fallback: number): number => {
  const value = getAppConfig(appId)[key];
  const count = typeof value === 'string' ? Number(value) : value;

  if (typeof count === 'number' && Number.isInteger(count) && count >= 1) {
    return count;
  }

  return fallback;
};
