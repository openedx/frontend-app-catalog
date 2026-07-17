import { render, screen } from '@testing-library/react';
import { getAuthenticatedUser, getSiteConfig, IntlProvider } from '@openedx/frontend-base';

import messages from '../messages';
import { CourseOverview } from '.';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedUser: jest.fn(),
}));

const mockGetAuthenticatedUser = getAuthenticatedUser as jest.Mock;

const mockCourseId = 'course-v1:TestX+Test101+2023';

const renderCourseOverview = (props: React.ComponentProps<typeof CourseOverview>) => render(
  <IntlProvider locale="en"><CourseOverview {...props} /></IntlProvider>,
);

describe('CourseOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthenticatedUser.mockReturnValue(null);
  });

  describe('Content rendering', () => {
    it('renders overview content when provided', () => {
      const overviewText = 'Course overview content';
      const overviewData = `<p>${overviewText}</p>`;

      renderCourseOverview({ overviewData, courseId: mockCourseId });
      expect(screen.getByText(overviewText)).toBeInTheDocument();
    });

    it('renders nothing for non-staff users', () => {
      const { container } = renderCourseOverview({ overviewData: '', courseId: mockCourseId });

      expect(container.firstChild).toBeNull();
    });

    it('renders Studio button for global staff users', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });

      renderCourseOverview({ overviewData: ' ', courseId: mockCourseId });

      const studioButton = screen.getByRole('link', {
        name: messages.viewAboutPageInStudio.defaultMessage,
      });

      expect(studioButton).toBeInTheDocument();
      expect(studioButton).toHaveAttribute(
        'href',
        `${getSiteConfig().cmsBaseUrl}/settings/details/${mockCourseId}`,
      );
    });

    it('processes overview content to replace image paths', () => {
      const overviewData = '<img src="/static/images/test.jpg" alt="Test" />';
      renderCourseOverview({ overviewData, courseId: mockCourseId });

      const img = screen.getByAltText('Test');
      expect(img).toHaveAttribute('src', `${getSiteConfig().lmsBaseUrl}/static/images/test.jpg`);
    });

    it('processes overview content with asset paths', () => {
      const overviewData = '<img src="/asset/test.jpg" alt="Test" />';
      renderCourseOverview({ overviewData, courseId: mockCourseId });

      const img = screen.getByAltText('Test');
      expect(img).toHaveAttribute('src', `${getSiteConfig().lmsBaseUrl}/asset/test.jpg`);
    });
  });

  describe('Global staff features', () => {
    it('shows Studio button for global staff user', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });
      renderCourseOverview({ overviewData: '<p>Content</p>', courseId: mockCourseId });

      const studioButton = screen.getByRole('link', {
        name: messages.viewAboutPageInStudio.defaultMessage,
      });
      expect(studioButton).toBeInTheDocument();
      expect(studioButton).toHaveAttribute(
        'href',
        `${getSiteConfig().cmsBaseUrl}/settings/details/${mockCourseId}`,
      );
    });

    it('hides Studio button for non-staff user', () => {
      mockGetAuthenticatedUser.mockReturnValue(null);
      renderCourseOverview({ overviewData: '<p>Content</p>', courseId: mockCourseId });

      expect(
        screen.queryByRole('link', {
          name: messages.viewAboutPageInStudio.defaultMessage,
        }),
      ).not.toBeInTheDocument();
    });

    it('hides Studio button for authenticated user without administrator role', () => {
      mockGetAuthenticatedUser.mockReturnValue({ username: 'testuser', administrator: false });
      renderCourseOverview({ overviewData: '<p>Content</p>', courseId: mockCourseId });

      expect(
        screen.queryByRole('link', {
          name: messages.viewAboutPageInStudio.defaultMessage,
        }),
      ).not.toBeInTheDocument();
    });
  });
});
