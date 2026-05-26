import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  socialSharingOptionsAriaLabel: {
    id: 'category.course-about.sidebar-social.social-sharing-options-aria-label',
    defaultMessage: 'Social sharing options',
    description: 'Aria label for social sharing options.',
  },
  socialSharingTooltip: {
    id: 'category.course-about.sidebar-social.social-sharing-tooltip',
    defaultMessage: 'Share with friends and family!',
    description: 'Tooltip for social sharing options.',
  },
  socialSharingTwitter: {
    id: 'category.course-about.sidebar-social.social-sharing-twitter',
    defaultMessage: 'Tweet that you\'ve enrolled in this course',
    description: 'Twitter sharing option.',
  },
  socialSharingFacebook: {
    id: 'category.course-about.sidebar-social.social-sharing-facebook',
    defaultMessage: 'Post a Facebook message to say you\'ve enrolled in this course',
    description: 'Facebook sharing option.',
  },
  socialSharingEmail: {
    id: 'category.course-about.sidebar-social.social-sharing-email',
    defaultMessage: 'Email someone to say you\'ve enrolled in this course',
    description: 'Email sharing option.',
  },
  socialSharingEmailSubject: {
    id: 'category.course-about.sidebar-social.social-sharing-email-subject',
    defaultMessage: 'Take a course with {siteName} online',
    description: 'Email subject for social sharing.',
  },
  socialSharingEmailBody: {
    id: 'category.course-about.sidebar-social.social-sharing-email-body',
    defaultMessage: 'I just enrolled in {courseNumber} {courseName} through {siteName} {url}',
    description: 'Email body for social sharing.',
  },
  socialSharingTwitterText: {
    id: 'category.course-about.sidebar-social.social-sharing-twitter-text',
    defaultMessage: 'I just enrolled in {courseNumber} {courseName} through {platformTwitter} {url}',
    description: 'Twitter text for social sharing.',
  },
});

export default messages;
