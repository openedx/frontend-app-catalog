import { useIntl } from '@openedx/frontend-base';

import { DATE_FORMAT_OPTIONS } from './constants';

export type IntlShape = ReturnType<typeof useIntl>;

/**
 * Formats a date string into a localized date format using React Intl.
 */
export const formatDate = (dateString: string, intl: IntlShape): string => {
  const date = new Date(dateString);
  return intl.formatDate(date, DATE_FORMAT_OPTIONS);
};
