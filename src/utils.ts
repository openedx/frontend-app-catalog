import { useIntl } from '@openedx/frontend-base';

import { DATE_FORMAT_OPTIONS } from './constants';

export type IntlShape = ReturnType<typeof useIntl>;

/**
 * Reports whether a string is a color the browser can render.
 *
 * Uses `CSS.supports` where available and falls back to assigning the value to
 * a detached element's `color`, which is the only way to validate colors in
 * environments without the CSS Object Model.
 */
export const isValidCssColor = (value: string) => {
  try {
    if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
      return CSS.supports('color', value);
    }

    if (typeof document === 'undefined') {
      return false;
    }

    const element = document.createElement('span');
    element.style.color = '';
    element.style.color = value;
    return element.style.color !== '';
  } catch {
    return false;
  }
};

/**
 * Formats a date string into a localized date format using React Intl.
 */
export const formatDate = (dateString: string, intl: IntlShape): string => {
  const date = new Date(dateString);
  return intl.formatDate(date, DATE_FORMAT_OPTIONS);
};
