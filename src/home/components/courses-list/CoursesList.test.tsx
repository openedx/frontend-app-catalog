import {
  cleanup, render, screen, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router';
import { getAppConfig, IntlProvider } from '@openedx/frontend-base';

import { mockCourseListSearchResponse } from '@src/__mocks__';
import { useCourseListSearch } from '@src/data/course-list-search/hooks';
import CoursesList from './CoursesList';

import messages from './messages';

const COURSES_URL = '/courses';
const DEFAULT_TEST_INFO_EMAIL = 'support@example.com';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  ErrorPage: ({ message }: { message: string }) => (
    <div data-testid="error-page">{message}</div>
  ),
  getAppConfig: jest.fn(),
  getUrlByRouteRole: jest.fn(() => COURSES_URL),
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: jest.fn(),
}));

jest.mock('@src/data/course-list-search/hooks', () => ({
  useCourseListSearch: jest.fn(),
}));

const mockedGetAppConfig = getAppConfig as jest.Mock;
const mockedUseNavigate = useNavigate as jest.Mock;
const mockUseCourseListSearch = useCourseListSearch as jest.Mock;

const renderCoursesList = () => render(
  <IntlProvider locale="en"><MemoryRouter><CoursesList /></MemoryRouter></IntlProvider>,
);

beforeEach(() => {
  mockedGetAppConfig.mockReturnValue({
    INFO_EMAIL: DEFAULT_TEST_INFO_EMAIL,
    HOMEPAGE_COURSE_MAX: 9,
    ENABLE_COURSE_SORTING_BY_START_DATE: false,
    NON_BROWSABLE_COURSES: false,
  });
  mockedUseNavigate.mockReturnValue(jest.fn());
});

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

    renderCoursesList();

    expect(screen.getByTestId('courses-list-loading')).toBeInTheDocument();
  });

  it('shows correct number of skeleton cards based on max courses config', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    mockedGetAppConfig.mockReturnValue({
      HOMEPAGE_COURSE_MAX: 2,
    });

    renderCoursesList();

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

    mockedGetAppConfig.mockReturnValue({
      HOMEPAGE_COURSE_MAX: undefined,
    });

    renderCoursesList();

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

    renderCoursesList();
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

    renderCoursesList();
    mockCourseListSearchResponse.results.forEach(course => {
      expect(screen.getByText(course.data.content.displayName)).toBeInTheDocument();
    });
  });

  it('shows "View All Courses" button when more courses are available than max', async () => {
    const mockNavigate = jest.fn();
    mockedUseNavigate.mockReturnValue(mockNavigate);

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    mockedGetAppConfig.mockReturnValue({
      HOMEPAGE_COURSE_MAX: 1,
      ENABLE_COURSE_SORTING_BY_START_DATE: false,
      NON_BROWSABLE_COURSES: false,
    });

    renderCoursesList();
    const button = screen.getByText(messages.viewAllCoursesButton.defaultMessage);

    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(COURSES_URL);
  });

  it('does not show "View All Courses" button when courses ≤ max', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    mockedGetAppConfig.mockReturnValue({
      HOMEPAGE_COURSE_MAX: 3,
      ENABLE_COURSE_SORTING_BY_START_DATE: false,
      NON_BROWSABLE_COURSES: false,
    });

    renderCoursesList();
    expect(screen.queryByText(messages.viewAllCoursesButton.defaultMessage)).not.toBeInTheDocument();
  });

  it('shows error state when courses loading fails', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: true,
      data: null,
    });

    mockedGetAppConfig.mockReturnValue({
      INFO_EMAIL: DEFAULT_TEST_INFO_EMAIL,
    });

    renderCoursesList();

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-danger');

    const errorPage = screen.getByTestId('error-page');
    expect(errorPage).toHaveTextContent(messages.errorMessage.defaultMessage.replace('{supportEmail}', DEFAULT_TEST_INFO_EMAIL));
  });

  it('returns null when NON_BROWSABLE_COURSES is enabled', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    mockedGetAppConfig.mockReturnValue({
      NON_BROWSABLE_COURSES: true,
    });

    const { container } = renderCoursesList();
    expect(container.firstChild).toBeNull();
  });
});
