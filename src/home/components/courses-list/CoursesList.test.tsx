import * as reactRouter from 'react-router';

import {
  render, userEvent, cleanup, within,
} from '../../../setupTest';
import { mockCourseDiscoveryResponse } from '../../../__mocks__';
import { useHomeSettingsQuery } from '../../data/hooks';
import { useCourseDiscovery } from '../../../data/course-discovery/hooks';
import CoursesList from './CoursesList';

import messages from './messages';

jest.mock('../../data/hooks', () => ({
  useHomeSettingsQuery: jest.fn(),
}));

jest.mock('../../../data/course-discovery/hooks', () => ({
  useCourseDiscovery: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    INFO_EMAIL: 'support@example.com',
  })),
}));

const mockUseHomeCoursesQuery = useCourseDiscovery as jest.Mock;
const mockUseHomeSettingsQuery = useHomeSettingsQuery as jest.Mock;

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

beforeEach(() => {
  mockUseHomeSettingsQuery.mockReturnValue({
    data: {
      homepageCourseMax: 9,
      enableCourseSortingByStartDate: false,
    },
  });
});

describe('<CoursesList />', () => {
  it('shows loading state', () => {
    mockUseHomeCoursesQuery.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    const { getByRole } = render(<CoursesList />);
    expect(getByRole('status')).toBeInTheDocument();
  });

  it('shows empty courses state', () => {
    mockUseHomeCoursesQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        ...mockCourseDiscoveryResponse,
        results: [],
      },
    });

    const { getByRole } = render(<CoursesList />);
    const infoAlert = getByRole('alert');
    expect(within(infoAlert).getByText(messages.noCoursesAvailable.defaultMessage)).toBeInTheDocument();
    expect(within(infoAlert).getByText(messages.noCoursesAvailableMessage.defaultMessage)).toBeInTheDocument();
  });

  it('displays courses when data is available', () => {
    mockUseHomeCoursesQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseDiscoveryResponse,
    });

    const { getByText } = render(<CoursesList />);
    mockCourseDiscoveryResponse.results.forEach(course => {
      expect(getByText(course.data.content.displayName)).toBeInTheDocument();
    });
  });

  it('shows "View All Courses" button when more courses are available than max', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(reactRouter, 'useNavigate').mockReturnValue(mockNavigate);

    mockUseHomeCoursesQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseDiscoveryResponse,
    });

    mockUseHomeSettingsQuery.mockReturnValueOnce({
      data: {
        homepageCourseMax: 1,
        enableCourseSortingByStartDate: false,
      },
    });

    const { getByText } = render(<CoursesList />);
    const button = getByText(messages.viewAllCoursesButton.defaultMessage);

    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith('/courses');
  });

  it('does not show "View All Courses" button when courses ≤ max', () => {
    mockUseHomeCoursesQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseDiscoveryResponse,
    });

    mockUseHomeSettingsQuery.mockReturnValueOnce({
      data: {
        homepageCourseMax: 3,
        enableCourseSortingByStartDate: false,
      },
    });

    const { queryByText } = render(<CoursesList />);
    expect(queryByText(messages.viewAllCoursesButton.defaultMessage)).not.toBeInTheDocument();
  });

  it('handles missing homeSettingsData gracefully', () => {
    mockUseHomeSettingsQuery.mockReturnValueOnce({ data: undefined });

    mockUseHomeCoursesQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseDiscoveryResponse,
    });

    const { getByText } = render(<CoursesList />);
    expect(getByText(mockCourseDiscoveryResponse.results[0].data.content.displayName)).toBeInTheDocument();
  });
});
