import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  IntlProvider, WidgetOperationTypes, getSiteConfig, setSiteConfig,
} from '@openedx/frontend-base';

import { mockCourseAboutResponse } from '@src/__mocks__';
import { appId } from '@src/constants';
import { expandCourseAboutData } from '@src/course-about/fallback';
import sidebarSocialMessages from '@src/course-about/course-sidebar/sidebar-social/messages';
import type { ShareTarget } from '@src/course-about/types';

import CourseAboutSidebarSlot, { type CourseAboutSidebarSlotProps } from '.';

const SLOT_ID = 'org.openedx.frontend.slot.catalog.courseAboutSidebar.v1';
const realSiteConfig = getSiteConfig();

const received: CourseAboutSidebarSlotProps[] = [];

const Probe = (props: CourseAboutSidebarSlotProps) => {
  received.push(props);
  return <span data-testid="probe" />;
};

/** Registers a probe widget where the default sidebar content would render. */
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
    setSiteConfig(realSiteConfig);
  });

  it('forwards the share policy to a widget on the slot', () => {
    installProbeWidget();
    const shareTarget: ShareTarget = { kind: 'url', href: 'https://example.com/courses/1/about' };

    renderSlot(shareTarget);

    expect(screen.getByTestId('probe')).toBeInTheDocument();
    expect(received[received.length - 1]?.shareTarget).toEqual(shareTarget);
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
});
