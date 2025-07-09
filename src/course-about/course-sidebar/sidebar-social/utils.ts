import { getConfig } from '@edx/frontend-platform';
import { IntlShape } from '@edx/frontend-platform/i18n';
import {
  BsFacebook as BsFacebookIcon,
  BsTwitterX as BsTwitterXIcon,
  Email as EmailIcon,
} from '@openedx/paragon/icons';

import { CourseAboutData } from './types';
import messages from './messages';

/**
 * Gets the formatted share text for different social sharing platforms
 */
const getShareText = (intl: IntlShape) => ({
  EMAIL_SUBJECT: intl.formatMessage(messages.socialSharingEmailSubject),
  EMAIL_BODY: intl.formatMessage(messages.socialSharingEmailBody),
  TWEET: intl.formatMessage(messages.socialSharingTwitterText),
});

/**
 * Generates a Twitter share URL with formatted tweet text
 */
export const getTwitterShareUrl = (data: CourseAboutData, frontendConfigData, intl: IntlShape) => {
  const tweetText = getShareText(intl).TWEET
    .replace('{courseNumber}', data.displayNumberWithDefault)
    .replace('{courseName}', data.name)
    .replace('{platformTwitter}', frontendConfigData.courseAboutTwitterAccount)
    .replace('{url}', window.location.href);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
};

/**
 * Generates a mailto URL for sharing course via email
 */
export const getEmailShareUrl = (courseData: CourseAboutData, intl: IntlShape) => {
  const subject = getShareText(intl).EMAIL_SUBJECT.replace('{siteName}', getConfig().SITE_NAME);
  const body = getShareText(intl).EMAIL_BODY
    .replace('{courseNumber}', courseData.displayNumberWithDefault)
    .replace('{courseName}', courseData.name)
    .replace('{siteName}', getConfig().SITE_NAME)
    .replace('{url}', window.location.href);
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
export const getSocialLinks = (intl: IntlShape, frontendConfigData) => [
  {
    id: 'twitter',
    destination: (courseAboutData: CourseAboutData) => getTwitterShareUrl(courseAboutData, frontendConfigData, intl),
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
