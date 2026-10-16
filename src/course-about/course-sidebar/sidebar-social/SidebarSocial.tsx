import { useMemo } from 'react';
import {
  Tooltip, OverlayTrigger, Card,
} from '@openedx/paragon';
import { useIntl } from '@openedx/frontend-base';

import type { CourseAboutData } from '@src/course-about/types';
import CourseAboutSidebarSocialSlot from '@src/slots/CourseAboutSidebarSocialSlot';
import { getSocialLinks } from './utils';
import messages from './messages';

const SidebarSocial = ({
  courseAboutData,
  shareUrl,
}: {
  courseAboutData: CourseAboutData;
  shareUrl?: string;
}) => {
  const intl = useIntl();

  const socialLinks = useMemo(
    () => getSocialLinks(intl, shareUrl).map((link) => ({
      ...link,
      destination: link.destination(courseAboutData),
    })),
    [courseAboutData, intl, shareUrl],
  );

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
        <CourseAboutSidebarSocialSlot socialLinks={socialLinks} />
        <Card.Divider />
      </header>
    </OverlayTrigger>
  );
};

export default SidebarSocial;
