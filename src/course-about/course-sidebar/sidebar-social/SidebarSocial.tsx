import {
  Tooltip, OverlayTrigger, Card,
} from '@openedx/paragon';
import { getSiteConfig, useIntl } from '@openedx/frontend-base';

import { getStringConfig } from '@src/config';
import type { CourseAboutData } from '@src/course-about/types';
import { getShareLinks, type ShareTarget } from '@src/generic/share-links';
import CourseAboutSidebarSocialSlot from '@src/slots/CourseAboutSidebarSocialSlot';

import messages from './messages';

const CURRENT_PAGE: ShareTarget = { kind: 'current-page' };

const SidebarSocial = ({
  courseAboutData,
  shareTarget = CURRENT_PAGE,
}: {
  courseAboutData: CourseAboutData;
  shareTarget?: ShareTarget;
}) => {
  const intl = useIntl();

  // Built per render: a current-page target reads the live location, so the
  // destinations follow a hash-syncing host instead of a cached href.
  const { links } = getShareLinks({
    twitterLabel: intl.formatMessage(messages.socialSharingTwitter),
    facebookLabel: intl.formatMessage(messages.socialSharingFacebook),
    emailLabel: intl.formatMessage(messages.socialSharingEmail),
    twitterText: url => intl.formatMessage(messages.socialSharingTwitterText, {
      courseNumber: courseAboutData.displayNumberWithDefault,
      courseName: courseAboutData.name,
      platformTwitter: getStringConfig('COURSE_ABOUT_TWITTER_ACCOUNT'),
      url,
    }),
    emailSubject: intl.formatMessage(messages.socialSharingEmailSubject, {
      siteName: getSiteConfig().siteName,
    }),
    emailBody: url => intl.formatMessage(messages.socialSharingEmailBody, {
      courseNumber: courseAboutData.displayNumberWithDefault,
      courseName: courseAboutData.name,
      siteName: getSiteConfig().siteName,
      url,
    }),
  }, shareTarget);

  return (
    <OverlayTrigger
      placement="top"
      overlay={(
        <Tooltip id="tooltip-top">
          {intl.formatMessage(messages.socialSharingTooltip)}
        </Tooltip>
      )}
    >
      <header>
        <CourseAboutSidebarSocialSlot socialLinks={links} shareTarget={shareTarget} />
        <Card.Divider />
      </header>
    </OverlayTrigger>
  );
};

export default SidebarSocial;
