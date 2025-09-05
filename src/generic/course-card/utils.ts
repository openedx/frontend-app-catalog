import { getConfig } from '@edx/frontend-platform';
import type { IntlShape } from '@edx/frontend-platform/i18n';

import { DATE_FORMAT_OPTIONS } from '@src/constants';
import type { Course } from './types';

/**
 * Constructs a full URL for an image by combining the LMS base URL with the provided image path.
 */
export const getFullImageUrl = (path?: string) => {
  if (!path) {
    return '';
  }
  return `${getConfig().LMS_BASE_URL}${path}`;
};

/**
 * Constructs a start date display for a course by combining the advertised start date and the start date.
 */
export const getStartDateDisplay = (course: Course, intl: IntlShape) => {
  if (course?.data?.advertisedStart) {
    return course.data.advertisedStart;
  }

  if (course?.data?.start) {
    return intl.formatDate(new Date(course.data.start), DATE_FORMAT_OPTIONS);
  }

  return '';
};
