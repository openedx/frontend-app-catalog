import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { mockCourseListSearchResponse, mockCourseAboutResponse } from './__mocks__';
import messages from './catalog/messages';
import { useCourseListSearch } from './data/course-list-search/hooks';
import { useCourseAboutData } from './course-about/data/hooks';
import courseAboutIntroMessages from './course-about/course-intro/messages';
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

jest.mock('./data/course-list-search/hooks', () => ({
  useCourseListSearch: jest.fn(),
}));

jest.mock('./course-about/data/hooks', () => ({
  useCourseAboutData: jest.fn(),
  useEnrollment: jest.fn(() => jest.fn()),
}));

jest.mock('./header/hooks/useMenuItems', () => ({
  useMenuItems: jest.fn(() => ([])),
}));

const mockCourseListSearch = useCourseListSearch as jest.Mock;
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

  mockCourseListSearch.mockReturnValue({
    data: mockCourseListSearchResponse,
    isLoading: false,
    isError: false,
    fetchData: jest.fn(),
    isFetching: false,
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

    expect(screen.getByText(messages.exploreCourses.defaultMessage)).toBeInTheDocument();

    const courseCards = screen.getAllByRole('link');
    expect(courseCards.length).toBe(mockCourseListSearchResponse.results.length);

    courseCards.forEach((card, index) => {
      const course = mockCourseListSearchResponse.results[index];
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

    expect(screen.getByRole('heading', { name: mockCourseAboutResponse.name })).toBeInTheDocument();
    expect(screen.getByText(mockCourseAboutResponse.org)).toBeInTheDocument();
    expect(screen.getByText(mockCourseAboutResponse.shortDescription)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: courseAboutIntroMessages.enrollNowBtn.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: mockCourseAboutResponse.name })).toBeInTheDocument();
  });

  it('renders NotFoundPage on unknown route', () => {
    window.testHistory = ['/some-unknown-path'];

    render(<App />);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
});
