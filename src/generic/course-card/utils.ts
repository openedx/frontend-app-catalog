import { formatDate, type IntlShape } from '@src/utils';
import type { Course } from './types';

/**
 * Constructs a start date display for a course by combining the advertised start date and the start date.
 */
export const getStartDateDisplay = (
  courseData: Partial<Pick<Course['data'], 'advertisedStart' | 'start'>>,
  intl: IntlShape,
) => {
  if (courseData?.advertisedStart) {
    return courseData.advertisedStart;
  }

  if (courseData?.start) {
    return formatDate(courseData.start, intl);
  }

  return '';
};
