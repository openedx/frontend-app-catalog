import { Stack } from '@openedx/paragon';
import { useIntl } from '@openedx/frontend-base';

import SocialLinks from '@src/course-about/course-sidebar/sidebar-social/SocialLinks';
import messages from '@src/course-about/course-sidebar/sidebar-social/messages';
import type { SocialLink } from '@src/course-about/course-sidebar/sidebar-social/types';

const CourseAboutSidebarSocialSlot = ({ socialLinks }: { socialLinks: SocialLink[] }) => {
  const intl = useIntl();

  return (
    <Stack
      className="justify-content-center my-3"
      direction="horizontal"
      gap={4}
      aria-label={intl.formatMessage(messages.socialSharingOptionsAriaLabel)}
    >
      <>
        <SocialLinks socialLinks={socialLinks} />
      </>
    </Stack>
  );
};

export default CourseAboutSidebarSocialSlot;
