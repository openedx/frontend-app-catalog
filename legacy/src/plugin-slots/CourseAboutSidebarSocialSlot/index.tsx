import { Stack } from '@openedx/paragon';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useIntl } from '@edx/frontend-platform/i18n';

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
      <PluginSlot
        id="org.openedx.frontend.catalog.course_about_page.sidebar.social"
        slotOptions={{
          mergeProps: true,
        }}
        pluginProps={{ socialLinks }}
      >
        <SocialLinks socialLinks={socialLinks} />
      </PluginSlot>
    </Stack>
  );
};

export default CourseAboutSidebarSocialSlot;
