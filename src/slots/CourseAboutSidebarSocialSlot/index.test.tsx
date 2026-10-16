import { render, screen } from '@testing-library/react';
import {
  IntlProvider, WidgetOperationTypes, getSiteConfig, setSiteConfig,
} from '@openedx/frontend-base';

import { appId } from '@src/constants';
import socialMessages from '@src/course-about/course-sidebar/sidebar-social/messages';
import { getShareLinks, type ShareCopy, type ShareTarget } from '@src/generic/share-links';

import CourseAboutSidebarSocialSlot, { type CourseAboutSidebarSocialSlotProps } from '.';

const SLOT_ID = 'org.openedx.frontend.slot.catalog.courseAboutSidebarSocial.v1';
const realSiteConfig = getSiteConfig();

const received: CourseAboutSidebarSocialSlotProps[] = [];

const Probe = (props: CourseAboutSidebarSocialSlotProps) => {
  received.push(props);
  return <span data-testid="probe" />;
};

/** Registers a probe widget where the default social links would render. */
const installProbeWidget = () => {
  const [firstApp] = realSiteConfig.apps ?? [];

  setSiteConfig({
    ...realSiteConfig,
    apps: [{
      ...firstApp,
      appId,
      slots: [{
        slotId: SLOT_ID,
        id: 'probe',
        op: WidgetOperationTypes.REPLACE,
        relatedId: 'defaultContent',
        component: Probe,
      }],
    }],
  });
};

const copy: ShareCopy = {
  twitterLabel: 'Tweet about this course',
  facebookLabel: 'Post a Facebook message',
  emailLabel: 'Email someone',
  twitterText: url => `Look at ${url}`,
  emailSubject: 'A course for you',
  emailBody: url => `I enrolled, see ${url}`,
};

const renderSlot = (shareTarget: ShareTarget) => {
  const { links } = getShareLinks(copy, shareTarget);

  return render(
    <IntlProvider locale="en">
      <CourseAboutSidebarSocialSlot socialLinks={links} shareTarget={shareTarget} />
    </IntlProvider>,
  );
};

describe('CourseAboutSidebarSocialSlot', () => {
  afterEach(() => {
    received.length = 0;
    setSiteConfig(realSiteConfig);
  });

  it('forwards the links and the share policy to a widget on the slot', () => {
    installProbeWidget();
    const shareTarget: ShareTarget = { kind: 'url', href: 'https://example.com/courses/1/about' };

    renderSlot(shareTarget);

    expect(screen.getByTestId('probe')).toBeInTheDocument();
    const lastCall = received[received.length - 1];
    expect(lastCall?.shareTarget).toEqual(shareTarget);
    expect(lastCall?.socialLinks.map((link) => link.id)).toEqual(['twitter', 'facebook', 'email']);
  });

  it('renders the default widget from the slot props', () => {
    renderSlot({ kind: 'url', href: 'https://example.com/courses/1/about' });

    // The Slot's layout labels the region; a div carries no implicit group role.
    expect(screen.getByLabelText(socialMessages.socialSharingOptionsAriaLabel.defaultMessage))
      .toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });
});
