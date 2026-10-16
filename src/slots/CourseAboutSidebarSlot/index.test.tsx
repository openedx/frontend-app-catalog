import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  IntlProvider, WidgetOperationTypes, getSiteConfig, setSiteConfig,
} from '@openedx/frontend-base';

import { mockCourseAboutResponse } from '@src/__mocks__';
import { appId } from '@src/constants';
import { expandCourseAboutData } from '@src/course-about/fallback';
import sidebarSocialMessages from '@src/course-about/course-sidebar/sidebar-social/messages';
import type { ShareTarget } from '@src/generic/share-links';

import CourseAboutSidebarSlot, { type CourseAboutSidebarSlotProps } from '.';

const SLOT_ID = 'org.openedx.frontend.slot.catalog.courseAboutSidebar.v1';
const SOCIAL_SLOT_ID = 'org.openedx.frontend.slot.catalog.courseAboutSidebarSocial.v1';
const realSiteConfig = getSiteConfig();

const received: CourseAboutSidebarSlotProps[] = [];
const receivedSocial: { shareTarget?: ShareTarget }[] = [];

const Probe = (props: CourseAboutSidebarSlotProps) => {
  received.push(props);
  return <span data-testid="probe" />;
};

/** Records only the policy, so the same installer serves both sidebar slots. */
const SocialProbe = ({ shareTarget }: { shareTarget?: ShareTarget }) => {
  receivedSocial.push({ shareTarget });
  return <span data-testid="social-probe" />;
};

/** Registers a probe widget where the slot's default content would render. */
const installProbeWidget = (slotId: string, component: typeof Probe) => {
  const [firstApp] = realSiteConfig.apps ?? [];

  setSiteConfig({
    ...realSiteConfig,
    apps: [{
      ...firstApp,
      appId,
      slots: [{
        slotId,
        id: 'probe',
        op: WidgetOperationTypes.REPLACE,
        relatedId: 'defaultContent',
        component,
      }],
    }],
  });
};

const renderSlot = (shareTarget?: ShareTarget) => render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <CourseAboutSidebarSlot
        courseAboutData={expandCourseAboutData(mockCourseAboutResponse)}
        shareTarget={shareTarget}
      />
    </MemoryRouter>
  </IntlProvider>,
);

describe('CourseAboutSidebarSlot', () => {
  afterEach(() => {
    received.length = 0;
    receivedSocial.length = 0;
    setSiteConfig(realSiteConfig);
  });

  it('forwards the share policy to a widget on the slot', () => {
    installProbeWidget(SLOT_ID, Probe);
    const shareTarget: ShareTarget = { kind: 'url', href: 'https://example.com/courses/1/about' };

    renderSlot(shareTarget);

    expect(screen.getByTestId('probe')).toBeInTheDocument();
    expect(received[received.length - 1]?.shareTarget).toEqual(shareTarget);
  });

  it('defaults an omitted policy to the current page for the Adapter', () => {
    installProbeWidget(SLOT_ID, Probe);

    renderSlot();

    expect(received[received.length - 1]?.shareTarget).toEqual({ kind: 'current-page' });
  });

  it('forwards the same concrete policy down to the social Slot when it is omitted', () => {
    installProbeWidget(SOCIAL_SLOT_ID, SocialProbe);

    renderSlot();

    expect(screen.getByTestId('social-probe')).toBeInTheDocument();
    expect(receivedSocial[receivedSocial.length - 1]?.shareTarget).toEqual({ kind: 'current-page' });
  });

  it('hides the default social controls when the policy is hidden', () => {
    renderSlot({ kind: 'hidden' });

    expect(screen.queryByRole('link', { name: sidebarSocialMessages.socialSharingFacebook.defaultMessage }))
      .not.toBeInTheDocument();
  });

  it('points the default social controls at an explicit target', () => {
    const href = 'https://example.com/courses/1/about';

    renderSlot({ kind: 'url', href });

    expect(screen.getByRole('link', { name: sidebarSocialMessages.socialSharingFacebook.defaultMessage }))
      .toHaveAttribute('href', expect.stringContaining(encodeURIComponent(href)));
  });

  it('shares the current page from the default controls when the policy is omitted', () => {
    renderSlot();

    const href = screen.getByRole('link', { name: sidebarSocialMessages.socialSharingFacebook.defaultMessage })
      .getAttribute('href') ?? '';

    expect(new URL(href).searchParams.get('u')).toBe(window.location.href);
  });
});
