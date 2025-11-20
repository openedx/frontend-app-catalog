import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

import { render, screen } from '@src/setupTest';
import messages from '../messages';
import { CourseOverview } from '.';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  getAuthenticatedUser: jest.fn(() => ({ username: 'test-user', roles: [] })),
  getConfig: jest.fn(),
}));

const mockGetAuthenticatedUser = getAuthenticatedUser as jest.Mock;
const mockGetConfig = getConfig as jest.Mock;

const mockCourseId = 'course-v1:TestX+Test101+2023';

describe('CourseOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfig.mockReturnValue({
      LMS_BASE_URL: process.env.LMS_BASE_URL,
      STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
    });
    mockGetAuthenticatedUser.mockReturnValue(null);
  });

  describe('Content rendering', () => {
    it('renders overview content when provided', () => {
      const overviewText = 'Course overview content';
      const overviewData = `<p>${overviewText}</p>`;

      render(<CourseOverview overviewData={overviewData} courseId={mockCourseId} />);
      expect(screen.getByText(overviewText)).toBeInTheDocument();
    });

    it('renders nothing for non-staff users', () => {
      const { container } = render(<CourseOverview overviewData="" courseId={mockCourseId} />);

      expect(container.firstChild).toBeNull();
    });

    it('renders Studio button for global staff users', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });

      render(<CourseOverview overviewData=" " courseId={mockCourseId} />);

      const studioButton = screen.getByRole('link', {
        name: messages.viewAboutPageInStudio.defaultMessage,
      });

      expect(studioButton).toBeInTheDocument();
      expect(studioButton).toHaveAttribute(
        'href',
        `${getConfig().STUDIO_BASE_URL}/settings/details/${mockCourseId}`,
      );
    });

    it('processes overview content to replace image paths', () => {
      const overviewData = '<img src="/static/images/test.jpg" alt="Test" />';
      render(<CourseOverview overviewData={overviewData} courseId={mockCourseId} />);

      const img = screen.getByAltText('Test');
      expect(img).toHaveAttribute('src', `${getConfig().LMS_BASE_URL}/static/images/test.jpg`);
    });

    it('processes overview content with asset paths', () => {
      const overviewData = '<img src="/asset/test.jpg" alt="Test" />';
      render(<CourseOverview overviewData={overviewData} courseId={mockCourseId} />);

      const img = screen.getByAltText('Test');
      expect(img).toHaveAttribute('src', `${getConfig().LMS_BASE_URL}/asset/test.jpg`);
    });
  });

  describe('Global staff features', () => {
    it('shows Studio button for global staff user', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });
      render(<CourseOverview overviewData="<p>Content</p>" courseId={mockCourseId} />);

      const studioButton = screen.getByRole('link', {
        name: messages.viewAboutPageInStudio.defaultMessage,
      });
      expect(studioButton).toBeInTheDocument();
      expect(studioButton).toHaveAttribute(
        'href',
        `${getConfig().STUDIO_BASE_URL}/settings/details/${mockCourseId}`,
      );
    });

    it('hides Studio button for non-staff user', () => {
      mockGetAuthenticatedUser.mockReturnValue(null);
      render(<CourseOverview overviewData="<p>Content</p>" courseId={mockCourseId} />);

      expect(
        screen.queryByRole('link', {
          name: messages.viewAboutPageInStudio.defaultMessage,
        }),
      ).not.toBeInTheDocument();
    });

    it('hides Studio button for authenticated user without administrator role', () => {
      mockGetAuthenticatedUser.mockReturnValue({ username: 'testuser', administrator: false });
      render(<CourseOverview overviewData="<p>Content</p>" courseId={mockCourseId} />);

      expect(
        screen.queryByRole('link', {
          name: messages.viewAboutPageInStudio.defaultMessage,
        }),
      ).not.toBeInTheDocument();
    });
  });
});
