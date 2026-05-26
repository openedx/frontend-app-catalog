import { getConfig } from '@edx/frontend-platform';
import { IntlShape } from '@edx/frontend-platform/i18n';
import {
  BsFacebook as BsFacebookIcon,
  BsTwitterX as BsTwitterXIcon,
  Email as EmailIcon,
} from '@openedx/paragon/icons';

import type { CourseAboutData } from '../../types';
import messages from './messages';

/**
 * Gets the formatted share text for different social sharing platforms
 */
const getShareText = (intl: IntlShape, courseData: CourseAboutData) => ({
  EMAIL_SUBJECT: intl.formatMessage(messages.socialSharingEmailSubject, {
    siteName: getConfig().SITE_NAME,
  }),
  EMAIL_BODY: intl.formatMessage(messages.socialSharingEmailBody, {
    courseNumber: courseData.displayNumberWithDefault,
    courseName: courseData.name,
    siteName: getConfig().SITE_NAME,
    url: window.location.href,
  }),
  TWEET: intl.formatMessage(messages.socialSharingTwitterText, {
    courseNumber: courseData.displayNumberWithDefault,
    courseName: courseData.name,
    platformTwitter: getConfig().COURSE_ABOUT_TWITTER_ACCOUNT,
    url: window.location.href,
  }),
});

/**
 * Generates a Twitter share URL with formatted tweet text
 */
export const getTwitterShareUrl = (data: CourseAboutData, intl: IntlShape) => {
  const tweetText = getShareText(intl, data).TWEET;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
};

/**
 * Generates a mailto URL for sharing course via email
 */
export const getEmailShareUrl = (courseData: CourseAboutData, intl: IntlShape) => {
  const { EMAIL_SUBJECT, EMAIL_BODY } = getShareText(intl, courseData);
  return `mailto:?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(EMAIL_BODY)}`;
};

/**
 * Generates a Facebook share URL for the current page
 */
export const getFacebookShareUrl = () => {
  if (!window.location.href) { return '#'; }
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
};

/**
 * Returns an array of social sharing link configurations
 */
export const getSocialLinks = (intl: IntlShape) => [
  {
    id: 'twitter',
    destination: (courseAboutData: CourseAboutData) => getTwitterShareUrl(courseAboutData, intl),
    icon: BsTwitterXIcon,
    screenReaderText: intl.formatMessage(messages.socialSharingTwitter),
  },
  {
    id: 'facebook',
    destination: () => getFacebookShareUrl(),
    icon: BsFacebookIcon,
    screenReaderText: intl.formatMessage(messages.socialSharingFacebook),
  },
  {
    id: 'email',
    destination: (courseData: CourseAboutData) => getEmailShareUrl(courseData, intl),
    icon: EmailIcon,
    screenReaderText: intl.formatMessage(messages.socialSharingEmail),
  },
];
