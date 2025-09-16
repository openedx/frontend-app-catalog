import { mockCourseDiscoveryResponse } from './catalog/__mocks__';
import messages from './catalog/messages';
import { useCourseDiscovery } from './catalog/data/hooks';
import {
  render, within, waitFor, screen,
} from './setupTest';
import { ROUTES } from './routes';
import App from './App';

jest.mock('@edx/frontend-platform', () => ({
  getAuthenticatedUser: jest.fn(() => ({ username: 'test-user', roles: [] })),
  getConfig: jest.fn(() => ({
    LMS_BASE_URL: process.env.LMS_BASE_URL,
    ENABLE_PROGRAMS: process.env.ENABLE_PROGRAMS,
    ENABLE_COURSE_DISCOVERY: process.env.ENABLE_COURSE_DISCOVERY,
  })),
}));

jest.mock('./catalog/data/hooks', () => ({
  useCourseDiscovery: jest.fn(),
}));

const mockCourseDiscovery = useCourseDiscovery as jest.Mock;

jest.mock('@edx/frontend-platform/react', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="app-provider">{children}</div>,
}));

jest.mock('@edx/frontend-component-header', () => function getHeader() {
  return <div data-testid="header" />;
});

jest.mock('@edx/frontend-component-footer', () => ({
  FooterSlot: () => <div data-testid="footer" />,
}));

describe('App', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  mockCourseDiscovery.mockReturnValue({
    data: mockCourseDiscoveryResponse,
    isLoading: false,
    isError: false,
  });

  it('renders HomePage on "/" route', async () => {
    window.testHistory = [ROUTES.HOME];

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('home-banner')).toBeInTheDocument();
  });

  it('renders CatalogPage with course cards at /courses route', async () => {
    window.testHistory = [ROUTES.COURSES];

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(
        messages.totalCoursesHeading.defaultMessage.replace(
          '{totalCourses}',
          mockCourseDiscoveryResponse.results.length,
        ),
      ),
    ).toBeInTheDocument();

    const courseCards = screen.getAllByRole('link');
    expect(courseCards.length).toBe(mockCourseDiscoveryResponse.results.length);

    courseCards.forEach((card, index) => {
      const course = mockCourseDiscoveryResponse.results[index];
      const cardContent = within(card);

      expect(card).toHaveAttribute('href', `/courses/${course.id}/about`);
      expect(cardContent.getByText(course.data.content.displayName)).toBeInTheDocument();
      expect(cardContent.getByText(course.data.org)).toBeInTheDocument();
    });
  });

  it('renders CourseAboutPage on "/courses/some-course-id/about"', () => {
    window.testHistory = [ROUTES.COURSE_ABOUT];

    render(<App />);
    expect(screen.getByTestId('course-about-page')).toBeInTheDocument();
  });

  it('renders NotFoundPage on unknown route', () => {
    window.testHistory = ['/some-unknown-path'];

    render(<App />);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
});
