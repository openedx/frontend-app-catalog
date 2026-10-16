import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getAppConfig, getSiteConfig, IntlProvider } from '@openedx/frontend-base';

import { appId } from '@src/constants';
import { mockCourseAboutResponse } from '@src/__mocks__';
import ActualSidebarSocial from '../SidebarSocial';
import messages from '../messages';

const mockLocation = {
  href: 'https://example.com/course/test-course',
  origin: 'https://example.com',
  pathname: '/course/test-course',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

const SidebarSocial = (props: React.ComponentProps<typeof ActualSidebarSocial>) => (
  <IntlProvider locale="en"><ActualSidebarSocial {...props} /></IntlProvider>
);

/** Destination shapes and encoding are the shared Module's concern; these cover Course About copy. */
describe('SidebarSocial', () => {
  const defaultProps = {
    courseAboutData: mockCourseAboutResponse,
  };
  const linkFor = (label: string) => screen.getByText(label).closest('a') as HTMLAnchorElement;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });
  });

  it('renders the sharing region with its Course About tooltip', async () => {
    render(<SidebarSocial {...defaultProps} />);

    const region = screen.getByLabelText(messages.socialSharingOptionsAriaLabel.defaultMessage);
    expect(region).toBeInTheDocument();

    await userEvent.hover(region);

    expect(screen.getByText(messages.socialSharingTooltip.defaultMessage)).toBeInTheDocument();
  });

  it('labels every control with the Course About copy', async () => {
    render(<SidebarSocial {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(messages.socialSharingTwitter.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.socialSharingFacebook.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.socialSharingEmail.defaultMessage)).toBeInTheDocument();
    });
  });

  it('puts the course, site and share-target values into its copy', async () => {
    const courseData = {
      ...mockCourseAboutResponse,
      displayNumberWithDefault: 'CS101',
      name: 'Test Course',
    };

    const twitterAccount = getAppConfig(appId).COURSE_ABOUT_TWITTER_ACCOUNT as string;
    // Guard the copy assertion below: an empty handle would make it vacuous.
    expect(twitterAccount).not.toBe('');

    render(<SidebarSocial courseAboutData={courseData} />);

    await waitFor(() => {
      const tweet = new URL(linkFor(messages.socialSharingTwitter.defaultMessage).href)
        .searchParams.get('text') as string;
      expect(tweet).toContain(courseData.displayNumberWithDefault);
      expect(tweet).toContain(courseData.name);
      expect(tweet).toContain(twitterAccount);
      expect(tweet).toContain(window.location.href);

      const email = new URL(linkFor(messages.socialSharingEmail.defaultMessage).href);
      expect(email.searchParams.get('subject')).toContain(getSiteConfig().siteName);
      expect(email.searchParams.get('body')).toContain(courseData.name);
      expect(email.searchParams.get('body')).toContain(window.location.href);

      const facebook = new URL(linkFor(messages.socialSharingFacebook.defaultMessage).href);
      expect(facebook.searchParams.get('u')).toBe(window.location.href);
    });
  });
});
