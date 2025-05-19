import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { mockCourseDiscoveryResponse } from './сatalog/__mocks__';
import { mockHomeSettingsResponse } from './home/__mocks__';
import { mockCourseAboutResponse } from './__mocks__';
import messages from './сatalog/messages';
import { useHomeSettingsQuery } from './home/data/hooks';
import { useCourseDiscovery } from './сatalog/data/hooks';
import { useCourseAboutData } from './course-about/data/hooks';
import {
  render, within, waitFor, screen,
} from './setupTest';
import { ROUTES } from './routes';
import App from './App';

jest.mock('@edx/frontend-platform', () => ({
  getAuthenticatedUser: jest.fn(() => ({ username: 'test-user', roles: [] })),
  getConfig: jest.fn(() => ({
    LMS_BASE_URL: '',
    ENABLE_PROGRAMS: true,
    ENABLE_COURSE_DISCOVERY: true,
  })),
}));

jest.mock('./home/data/hooks', () => ({
  useHomeSettingsQuery: jest.fn(),
}));

jest.mock('./сatalog/data/hooks', () => ({
  useCourseDiscovery: jest.fn(),
}));

jest.mock('./course-about/data/hooks', () => ({
  useCourseAboutData: jest.fn(),
  useEnrollment: jest.fn(() => jest.fn()),
}));

jest.mock('./header/hooks/useMenuItems', () => ({
  useMenuItems: jest.fn(() => ([])),
}));

const mockHomeSettings = useHomeSettingsQuery as jest.Mock;
const mockCourseDiscovery = useCourseDiscovery as jest.Mock;
const mockCourseAbout = useCourseAboutData as jest.Mock;

jest.mock('@edx/frontend-platform/react', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="app-provider">{children}</div>,
}));

jest.mock('@edx/frontend-component-header', () => function getHeader() {
  return <div data-testid="header" />;
});

jest.mock('@edx/frontend-component-footer', () => ({
  FooterSlot: () => <div data-testid="footer" />,
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    (getAuthenticatedUser as jest.Mock).mockReturnValue(null);
    jest.clearAllMocks();
  });

  mockHomeSettings.mockReturnValue({
    data: mockHomeSettingsResponse,
    isLoading: false,
    isError: false,
  });

  mockCourseDiscovery.mockReturnValue({
    data: mockCourseDiscoveryResponse,
    isLoading: false,
    isError: false,
  });

  mockCourseAbout.mockReturnValue({
    data: mockCourseAboutResponse,
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

  it('renders CourseAboutPage on "/courses/some-course-id/about"', async () => {
    window.testHistory = [ROUTES.COURSE_ABOUT];
    const mockUser = { username: 'testuser' };
    (getAuthenticatedUser as jest.Mock).mockReturnValue(mockUser);

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('course-about-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: mockCourseAboutResponse.name })).toBeInTheDocument();
    expect(screen.getByText(mockCourseAboutResponse.org)).toBeInTheDocument();
    expect(screen.getByText(mockCourseAboutResponse.shortDescription)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enroll now' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: mockCourseAboutResponse.name })).toBeInTheDocument();
  });

  it('renders NotFoundPage on unknown route', () => {
    window.testHistory = ['/some-unknown-path'];

    render(<App />);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
});
