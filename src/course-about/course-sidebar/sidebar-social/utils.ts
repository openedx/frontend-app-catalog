import { getSiteConfig } from '@openedx/frontend-base';
import {
  BsFacebook as BsFacebookIcon,
  BsTwitterX as BsTwitterXIcon,
  Email as EmailIcon,
} from '@openedx/paragon/icons';

import type { IntlShape } from '@src/utils';
import { getStringConfig } from '@src/config';
import type { CourseAboutData } from '../../types';
import messages from './messages';

/**
 * Compatibility shims for the pre-Module social helpers.
 *
 * @deprecated Import `getShareLinks` and `ShareLinks` from
 * `@src/generic/share-links` instead. No production path uses this file; it
 * exists so callers written against the old Course About helpers keep
 * working, and it will be removed once none remain.
 *
 * These keep their own one-line URL shapes instead of delegating, because the
 * generic Module deliberately refuses the legacy edges they pin: an empty
 * target yields `'#'` for Facebook, and an explicit empty share URL still
 * builds a Twitter/email link rather than hiding sharing.
 */

/**
 * Gets the formatted share text for different social sharing platforms
 * @deprecated Use the `ShareCopy` callbacks accepted by `getShareLinks`.
 */
const getShareText = (intl: IntlShape, courseData: CourseAboutData, shareUrl: string) => ({
  EMAIL_SUBJECT: intl.formatMessage(messages.socialSharingEmailSubject, {
    siteName: getSiteConfig().siteName,
  }),
  EMAIL_BODY: intl.formatMessage(messages.socialSharingEmailBody, {
    courseNumber: courseData.displayNumberWithDefault,
    courseName: courseData.name,
    siteName: getSiteConfig().siteName,
    url: shareUrl,
  }),
  TWEET: intl.formatMessage(messages.socialSharingTwitterText, {
    courseNumber: courseData.displayNumberWithDefault,
    courseName: courseData.name,
    platformTwitter: getStringConfig('COURSE_ABOUT_TWITTER_ACCOUNT'),
    url: shareUrl,
  }),
});

/**
 * Generates a Twitter share URL with formatted tweet text
 * @deprecated Prefer `getShareLinks(copy, target)` from `@src/generic/share-links`.
 */
export const getTwitterShareUrl = (
  data: CourseAboutData,
  intl: IntlShape,
  shareUrl = window.location.href,
) => {
  const tweetText = getShareText(intl, data, shareUrl).TWEET;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
};

/**
 * Generates a mailto URL for sharing course via email
 * @deprecated Prefer `getShareLinks(copy, target)` from `@src/generic/share-links`.
 */
export const getEmailShareUrl = (
  courseData: CourseAboutData,
  intl: IntlShape,
  shareUrl = window.location.href,
) => {
  const { EMAIL_SUBJECT, EMAIL_BODY } = getShareText(intl, courseData, shareUrl);
  return `mailto:?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(EMAIL_BODY)}`;
};

/**
 * Generates a Facebook share URL for the given page URL, defaulting to the current page
 * @deprecated Prefer `getShareLinks(copy, target)` from `@src/generic/share-links`.
 * Returns `'#'` for an empty target, which the generic Module never emits.
 */
export const getFacebookShareUrl = (shareUrl = window.location.href) => {
  if (!shareUrl) {
    return '#';
  }
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
};

/**
 * Returns an array of social sharing link configurations.
 * shareUrl is the explicit share target; it defaults to the current page.
 * @deprecated Prefer `getShareLinks(copy, target)` from `@src/generic/share-links`.
 */
export const getSocialLinks = (intl: IntlShape, shareUrl?: string) => [
  {
    id: 'twitter',
    destination: (courseAboutData: CourseAboutData) => getTwitterShareUrl(courseAboutData, intl, shareUrl),
    icon: BsTwitterXIcon,
    screenReaderText: intl.formatMessage(messages.socialSharingTwitter),
  },
  {
    id: 'facebook',
    destination: () => getFacebookShareUrl(shareUrl),
    icon: BsFacebookIcon,
    screenReaderText: intl.formatMessage(messages.socialSharingFacebook),
  },
  {
    id: 'email',
    destination: (courseData: CourseAboutData) => getEmailShareUrl(courseData, intl, shareUrl),
    icon: EmailIcon,
    screenReaderText: intl.formatMessage(messages.socialSharingEmail),
  },
];
