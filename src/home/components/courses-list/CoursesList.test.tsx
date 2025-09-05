import { getConfig } from '@edx/frontend-platform';

import {
  render, userEvent, cleanup, within, screen, reactRouter,
} from '@src/setupTest';
import { mockCourseDiscoveryResponse } from '@src/__mocks__';
import { useCourseDiscovery } from '@src/data/course-discovery/hooks';
import CoursesList from './CoursesList';

import messages from './messages';

jest.mock('@src/data/course-discovery/hooks', () => ({
  useCourseDiscovery: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    INFO_EMAIL: process.env.INFO_EMAIL,
    HOMEPAGE_COURSE_MAX: process.env.HOMEPAGE_COURSE_MAX,
    ENABLE_COURSE_SORTING_BY_START_DATE: process.env.ENABLE_COURSE_SORTING_BY_START_DATE,
    NON_BROWSABLE_COURSES: process.env.NON_BROWSABLE_COURSES,
  })),
}));

const mockUseCourseDiscovery = useCourseDiscovery as jest.Mock;

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('<CoursesList />', () => {
  it('shows loading state', () => {
    mockUseCourseDiscovery.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    render(<CoursesList />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty courses state', () => {
    mockUseCourseDiscovery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        ...mockCourseDiscoveryResponse,
        results: [],
      },
    });

    render(<CoursesList />);
    const infoAlert = screen.getByRole('alert');
    expect(within(infoAlert).getByText(messages.noCoursesAvailable.defaultMessage)).toBeInTheDocument();
    expect(within(infoAlert).getByText(messages.noCoursesAvailableMessage.defaultMessage)).toBeInTheDocument();
  });

  it('displays courses when data is available', () => {
    mockUseCourseDiscovery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseDiscoveryResponse,
    });

    render(<CoursesList />);
    mockCourseDiscoveryResponse.results.forEach(course => {
      expect(screen.getByText(course.data.content.displayName)).toBeInTheDocument();
    });
  });

  it('shows "View All Courses" button when more courses are available than max', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(reactRouter, 'useNavigate').mockReturnValue(mockNavigate);

    mockUseCourseDiscovery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseDiscoveryResponse,
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
    mockUseCourseDiscovery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseDiscoveryResponse,
    });

    getConfig.mockReturnValue({
      HOMEPAGE_COURSE_MAX: 3,
      ENABLE_COURSE_SORTING_BY_START_DATE: false,
      NON_BROWSABLE_COURSES: false,
    });

    render(<CoursesList />);
    expect(screen.queryByText(messages.viewAllCoursesButton.defaultMessage)).not.toBeInTheDocument();
  });
});
