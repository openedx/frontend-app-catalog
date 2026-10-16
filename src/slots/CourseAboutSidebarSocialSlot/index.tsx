import { Stack } from '@openedx/paragon';
import {
  Slot,
  useIntl,
  useSlotContext,
  useWidgets,
  useWidgetOptions,
} from '@openedx/frontend-base';

import messages from '@src/course-about/course-sidebar/sidebar-social/messages';
import { ShareLinks, type ShareLink, type ShareTarget } from '@src/generic/share-links';

export interface CourseAboutSidebarSocialSlotProps {
  socialLinks: ShareLink[];
  /** Share policy for this render, forwarded so customizers can honour it. */
  shareTarget?: ShareTarget;
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
    socialLinks?: ShareLink[] | ((current: ShareLink[]) => ShareLink[]);
  };
  const resolved = typeof options.socialLinks === 'function'
    ? options.socialLinks(socialLinks)
    : options.socialLinks ?? socialLinks;
  return <ShareLinks links={resolved} />;
};

const CourseAboutSidebarSocialSlot = ({
  socialLinks,
  shareTarget,
}: CourseAboutSidebarSocialSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutSidebarSocial.v1"
    layout={SocialStackLayout}
    socialLinks={socialLinks}
    shareTarget={shareTarget}
  >
    <DefaultSocialLinksWidget />
  </Slot>
);

export default CourseAboutSidebarSocialSlot;
