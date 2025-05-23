import { IntlShape } from '@edx/frontend-platform/i18n';
import {
  AccessTimeFilled as AccessTimeFilledIcon,
  Event as EventIcon,
  Info as InfoIcon,
  MoneyFilled as MoneyFilledIcon,
} from '@openedx/paragon/icons';

import { formatDate } from '../../../utils';
import { SIDEBAR_DETAIL_KEYS, ENABLE_COSMETIC_DISPLAY_PRICE } from './constants';
import { CourseAboutData } from './types';
import messages from './messages';

/**
 * Generates an array of sidebar detail objects for course information display.
 * Each detail object contains metadata about a specific course attribute.
*/
export const getSidebarDetails = (intl: IntlShape, courseAboutData: CourseAboutData) => [
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
    value: formatDate((courseAboutData.advertisedStart || courseAboutData.start) ?? ''),
    show: !courseAboutData.startDateIsStillDefault,
  },
  {
    key: SIDEBAR_DETAIL_KEYS.END_DATE,
    icon: EventIcon,
    label: intl.formatMessage(messages.classesEnd),
    value: formatDate(courseAboutData.end ?? ''),
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
    key: SIDEBAR_DETAIL_KEYS.PRICE,
    icon: MoneyFilledIcon,
    label: intl.formatMessage(messages.price),
    value: courseAboutData.coursePrice,
    show: !!courseAboutData.coursePrice && ENABLE_COSMETIC_DISPLAY_PRICE,
  },
  {
    key: SIDEBAR_DETAIL_KEYS.REQUIREMENTS,
    icon: InfoIcon,
    label: intl.formatMessage(messages.requirements),
    value: courseAboutData.requirements,
    show: !!courseAboutData?.requirements,
  },
];
