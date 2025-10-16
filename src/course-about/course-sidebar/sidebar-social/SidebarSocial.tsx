import { useMemo } from 'react';
import {
  Icon, Stack, Hyperlink, Tooltip, OverlayTrigger, Card,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import type { CourseAboutData } from '@src/course-about/types';
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
        <Stack
          className="justify-content-center my-3"
          direction="horizontal"
          gap={4}
          aria-label={intl.formatMessage(messages.socialSharingOptionsAriaLabel)}
        >
          {socialLinks.map((link) => (
            <Hyperlink key={link.id} destination={link.destination}>
              <Icon
                src={link.icon}
                screenReaderText={link.screenReaderText}
                size="lg"
              />
            </Hyperlink>
          ))}
        </Stack>
        <Card.Divider />
      </header>
    </OverlayTrigger>
  );
};

export default SidebarSocial;
