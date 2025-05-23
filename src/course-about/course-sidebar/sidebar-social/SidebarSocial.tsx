import { useMemo } from 'react';
import {
  Icon, Stack, Hyperlink, Tooltip, OverlayTrigger,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { CourseAboutData } from './types';
import { getSocialLinks } from './utils';
import messages from './messages';

const SidebarSocial = ({ courseAboutData }: { courseAboutData: CourseAboutData }) => {
  const intl = useIntl();

  const socialLinks = useMemo(
    () => getSocialLinks(intl).map((link) => ({
      ...link,
      destination: typeof link.destination === 'function'
        ? link.destination(courseAboutData)
        : link.destination,
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
        <Stack
          className="course-sidebar-social-icons justify-content-center my-3"
          direction="horizontal"
          gap={4}
          aria-label={intl.formatMessage(messages.socialSharingOptionsAriaLabel)}
        >
          {socialLinks.map((link) => (
            <Hyperlink key={link.id} destination={link.destination}>
              <Icon
                className="course-sidebar-social-icon"
                src={link.icon}
                screenReaderText={link.screenReaderText}
                size="lg"
              />
            </Hyperlink>
          ))}
        </Stack>
      </header>
    </OverlayTrigger>
  );
};

export default SidebarSocial;
