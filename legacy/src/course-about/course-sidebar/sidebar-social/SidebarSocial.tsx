import { useMemo } from 'react';
import {
  Tooltip, OverlayTrigger, Card,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import type { CourseAboutData } from '@src/course-about/types';
import CourseAboutSidebarSocialSlot from '@src/plugin-slots/CourseAboutSidebarSocialSlot';
import { getSocialLinks } from './utils';
import messages from './messages';

const SidebarSocial = ({ courseAboutData }: { courseAboutData: CourseAboutData }) => {
  const intl = useIntl();

  const socialLinks = useMemo(
    () => getSocialLinks(intl).map((link) => ({
      ...link,
      destination: link.destination(courseAboutData),
    })),
    [courseAboutData, intl],
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
