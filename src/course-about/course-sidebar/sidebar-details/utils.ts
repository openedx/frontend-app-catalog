import { IntlShape } from '@edx/frontend-platform/i18n';
import {
  AccessTimeFilled as AccessTimeFilledIcon,
  Event as EventIcon,
  Info as InfoIcon,
} from '@openedx/paragon/icons';

import { formatDate } from '@src/utils';
import { SIDEBAR_DETAIL_KEYS } from './constants';
import type { CourseAboutData } from '../../types';
import messages from './messages';

/**
 * Generates an array of sidebar detail objects for course information display.
 * Each detail object contains metadata about a specific course attribute.
*/
export const getSidebarDetails = (
  intl: IntlShape,
  courseAboutData: CourseAboutData,
) => [
  {
    key: SIDEBAR_DETAIL_KEYS.COURSE_NUMBER,
    icon: InfoIcon,
    label: intl.formatMessage(messages.courseNumber),
    value: courseAboutData.displayNumberWithDefault,
    show: true,
  },
  {
    key: SIDEBAR_DETAIL_KEYS.START_DATE,
    icon: EventIcon,
    label: intl.formatMessage(messages.classesStart),
    value: formatDate(((courseAboutData.advertisedStart || courseAboutData.start) ?? ''), intl),
    show: !courseAboutData.startDateIsStillDefault,
  },
  {
    key: SIDEBAR_DETAIL_KEYS.END_DATE,
    icon: EventIcon,
    label: intl.formatMessage(messages.classesEnd),
    value: formatDate((courseAboutData.end ?? ''), intl),
    show: !!courseAboutData.end,
  },
  {
    key: SIDEBAR_DETAIL_KEYS.EFFORT,
    icon: AccessTimeFilledIcon,
    label: intl.formatMessage(messages.estimatedEffort),
    value: courseAboutData.effort,
    show: !!courseAboutData.effort,
  },
  {
    key: SIDEBAR_DETAIL_KEYS.REQUIREMENTS,
    icon: InfoIcon,
    label: intl.formatMessage(messages.requirements),
    value: courseAboutData.requirements,
    show: !!courseAboutData?.requirements,
  },
];
