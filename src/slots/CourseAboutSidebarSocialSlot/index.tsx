import { Stack } from '@openedx/paragon';
import {
  Slot,
  useIntl,
  useSlotContext,
  useWidgets,
  useWidgetOptions,
} from '@openedx/frontend-base';

import SocialLinks from '@src/course-about/course-sidebar/sidebar-social/SocialLinks';
import messages from '@src/course-about/course-sidebar/sidebar-social/messages';
import type { SocialLink } from '@src/course-about/course-sidebar/sidebar-social/types';

export interface CourseAboutSidebarSocialSlotProps {
  socialLinks: SocialLink[];
}

const SocialStackLayout = () => {
  const intl = useIntl();
  const widgets = useWidgets();
  return (
    <Stack
      className="justify-content-center my-3"
      direction="horizontal"
      gap={4}
      aria-label={intl.formatMessage(messages.socialSharingOptionsAriaLabel)}
    >
      {widgets}
    </Stack>
  );
};

const DefaultSocialLinksWidget = () => {
  const { socialLinks } = useSlotContext() as unknown as CourseAboutSidebarSocialSlotProps;
  const options = useWidgetOptions() as {
    socialLinks?: SocialLink[] | ((current: SocialLink[]) => SocialLink[]);
  };
  const resolved = typeof options.socialLinks === 'function'
    ? options.socialLinks(socialLinks)
    : options.socialLinks ?? socialLinks;
  return <SocialLinks socialLinks={resolved} />;
};

const CourseAboutSidebarSocialSlot = ({ socialLinks }: CourseAboutSidebarSocialSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutSidebarSocial.v1"
    layout={SocialStackLayout}
    socialLinks={socialLinks}
  >
    <DefaultSocialLinksWidget />
  </Slot>
);

export default CourseAboutSidebarSocialSlot;
