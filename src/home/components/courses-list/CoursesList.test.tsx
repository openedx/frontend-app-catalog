import { getConfig } from '@edx/frontend-platform';

import {
  render, userEvent, cleanup, within, screen, reactRouter,
} from '@src/setupTest';
import { mockCourseListSearchResponse } from '@src/__mocks__';
import { useCourseListSearch } from '@src/data/course-list-search/hooks';
import CoursesList from './CoursesList';

import messages from './messages';

jest.mock('@src/data/course-list-search/hooks', () => ({
  useCourseListSearch: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  ErrorPage: ({ message }: { message: string }) => (
    <div data-testid="error-page">{message}</div>
  ),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    INFO_EMAIL: process.env.INFO_EMAIL,
    HOMEPAGE_COURSE_MAX: process.env.HOMEPAGE_COURSE_MAX,
    ENABLE_COURSE_SORTING_BY_START_DATE: process.env.ENABLE_COURSE_SORTING_BY_START_DATE,
    NON_BROWSABLE_COURSES: process.env.NON_BROWSABLE_COURSES,
  })),
}));

const mockUseCourseListSearch = useCourseListSearch as jest.Mock;

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('<CoursesList />', () => {
  it('shows loading state', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    render(<CoursesList />);

    expect(screen.getByTestId('courses-list-loading')).toBeInTheDocument();
  });

  it('shows correct number of skeleton cards based on max courses config', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    getConfig.mockReturnValue({
      HOMEPAGE_COURSE_MAX: 2,
    });

    render(<CoursesList />);

    expect(screen.getAllByTestId('course-card')).toHaveLength(2);
    // Each CourseCard creates 4 skeleton elements (image, header, section, footer)
    // So 2 cards × 4 skeletons = 8 total skeleton elements
    expect(document.querySelectorAll('.react-loading-skeleton')).toHaveLength(8);
  });

  it('shows default number of skeleton cards when max courses not configured', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    getConfig.mockReturnValue({
      HOMEPAGE_COURSE_MAX: undefined,
    });

    render(<CoursesList />);

    expect(screen.getByTestId('courses-list-loading')).toBeInTheDocument();

    expect(screen.getAllByTestId('course-card')).toHaveLength(9);
    // Each CourseCard creates 4 skeleton elements (image, header, section, footer)
    // So 9 cards × 4 skeletons = 36 total skeleton elements
    expect(document.querySelectorAll('.react-loading-skeleton')).toHaveLength(36);
  });

  it('shows empty courses state', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        ...mockCourseListSearchResponse,
        results: [],
      },
    });

    render(<CoursesList />);
    const infoAlert = screen.getByRole('alert');
    expect(within(infoAlert).getByText(messages.noCoursesAvailable.defaultMessage)).toBeInTheDocument();
    expect(within(infoAlert).getByText(messages.noCoursesAvailableMessage.defaultMessage)).toBeInTheDocument();
  });

  it('displays courses when data is available', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    render(<CoursesList />);
    mockCourseListSearchResponse.results.forEach(course => {
      expect(screen.getByText(course.data.content.displayName)).toBeInTheDocument();
    });
  });

  it('shows "View All Courses" button when more courses are available than max', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(reactRouter, 'useNavigate').mockReturnValue(mockNavigate);

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    getConfig.mockReturnValue({
      HOMEPAGE_COURSE_MAX: 1,
      ENABLE_COURSE_SORTING_BY_START_DATE: false,
      NON_BROWSABLE_COURSES: false,
    });

    render(<CoursesList />);
    const button = screen.getByText(messages.viewAllCoursesButton.defaultMessage);

    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith('/courses');
  });

  it('does not show "View All Courses" button when courses ≤ max', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    getConfig.mockReturnValue({
      HOMEPAGE_COURSE_MAX: 3,
      ENABLE_COURSE_SORTING_BY_START_DATE: false,
      NON_BROWSABLE_COURSES: false,
    });

    render(<CoursesList />);
    expect(screen.queryByText(messages.viewAllCoursesButton.defaultMessage)).not.toBeInTheDocument();
  });

  it('shows error state when courses loading fails', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: true,
      data: null,
    });

    getConfig.mockReturnValue({
      INFO_EMAIL: process.env.INFO_EMAIL,
    });

    render(<CoursesList />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-danger');

    const errorPage = screen.getByTestId('error-page');
    expect(errorPage).toHaveTextContent(messages.errorMessage.defaultMessage.replace('{supportEmail}', getConfig().INFO_EMAIL));
  });

  it('returns null when NON_BROWSABLE_COURSES is enabled', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    getConfig.mockReturnValue({
      NON_BROWSABLE_COURSES: true,
    });

    const { container } = render(<CoursesList />);
    expect(container.firstChild).toBeNull();
  });
});
