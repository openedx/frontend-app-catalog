import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getAppConfig, getSiteConfig, IntlProvider } from '@openedx/frontend-base';

import { appId } from '@src/constants';
import { mockCourseAboutResponse } from '@src/__mocks__';
import SidebarSocial from '../SidebarSocial';
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

const renderSidebarSocial = (props: React.ComponentProps<typeof SidebarSocial>) => render(
  <IntlProvider locale="en"><SidebarSocial {...props} /></IntlProvider>,
);

describe('SidebarSocial', () => {
  const defaultProps = {
    courseAboutData: mockCourseAboutResponse,
  };

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });
  });

  it('should render social sharing options', async () => {
    renderSidebarSocial(defaultProps);

    await waitFor(() => {
      expect(screen.getByLabelText(
        messages.socialSharingOptionsAriaLabel.defaultMessage,
      )).toBeInTheDocument();
    });
  });

  it('should display tooltip on hover', async () => {
    renderSidebarSocial(defaultProps);

    const container = screen.getByLabelText(messages.socialSharingOptionsAriaLabel.defaultMessage);
    expect(container).toBeInTheDocument();

    await userEvent.hover(
      screen.getByLabelText(messages.socialSharingOptionsAriaLabel.defaultMessage),
    );

    expect(screen.getByText(messages.socialSharingTooltip.defaultMessage)).toBeInTheDocument();
  });

  it('should render Twitter sharing link', async () => {
    renderSidebarSocial(defaultProps);

    await waitFor(() => {
      const twitterLink = screen.getByText(messages.socialSharingTwitter.defaultMessage);
      expect(twitterLink).toBeInTheDocument();
      expect(twitterLink.closest('a'))
        .toHaveAttribute('href', expect.stringContaining('twitter.com/intent/tweet'));
    });
  });

  it('should render Facebook sharing link', async () => {
    renderSidebarSocial(defaultProps);

    await waitFor(() => {
      const facebookLink = screen.getByText(messages.socialSharingFacebook.defaultMessage);
      expect(facebookLink).toBeInTheDocument();
      expect(facebookLink.closest('a'))
        .toHaveAttribute('href', expect.stringContaining('facebook.com/sharer/sharer.php'));
    });
  });

  it('should render Email sharing link', async () => {
    renderSidebarSocial(defaultProps);

    await waitFor(() => {
      const emailLink = screen.getByText(messages.socialSharingEmail.defaultMessage);
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.closest('a')).toHaveAttribute('href', expect.stringContaining('mailto:'));
    });
  });

  it('should generate correct Twitter share URL with course data', async () => {
    const courseData = {
      ...mockCourseAboutResponse,
      displayNumberWithDefault: 'CS101',
      name: 'Test Course',
    };

    renderSidebarSocial({ courseAboutData: courseData });

    await waitFor(() => {
      const twitterLink = screen.getByText(messages.socialSharingTwitter.defaultMessage);
      const href = twitterLink.closest('a')?.getAttribute('href');

      expect(href).toContain('twitter.com/intent/tweet');
      expect(href).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
      expect(href).toContain(encodeURIComponent(courseData.name));
      expect(href).toContain(encodeURIComponent(getAppConfig(appId).COURSE_ABOUT_TWITTER_ACCOUNT as string));
      expect(href).toContain(encodeURIComponent(window.location.href));
    });
  });

  it('should generate correct Email share URL with course data', async () => {
    const courseData = {
      ...mockCourseAboutResponse,
      displayNumberWithDefault: 'MATH201',
      name: 'Advanced Mathematics',
    };

    renderSidebarSocial({ courseAboutData: courseData });

    await waitFor(() => {
      const emailLink = screen.getByText(messages.socialSharingEmail.defaultMessage);
      const href = emailLink.closest('a')?.getAttribute('href');

      expect(href).toContain('mailto:');
      expect(href).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
      expect(href).toContain(encodeURIComponent(courseData.name));
      expect(href).toContain(encodeURIComponent(getSiteConfig().siteName));
      expect(href).toContain(encodeURIComponent(window.location.href));
    });
  });

  it('should generate correct Facebook share URL', async () => {
    renderSidebarSocial(defaultProps);

    await waitFor(() => {
      const facebookLink = screen.getByText(messages.socialSharingFacebook.defaultMessage);
      const href = facebookLink.closest('a')?.getAttribute('href');

      expect(href).toContain('facebook.com/sharer/sharer.php');
      expect(href).toContain(encodeURIComponent(window.location.href));
    });
  });

  it('should render all social sharing icons', async () => {
    renderSidebarSocial(defaultProps);

    await waitFor(() => {
      expect(screen.getByText(messages.socialSharingTwitter.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.socialSharingFacebook.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.socialSharingEmail.defaultMessage)).toBeInTheDocument();
    });
  });
});
