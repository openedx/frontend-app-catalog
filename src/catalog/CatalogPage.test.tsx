import { getConfig } from '@edx/frontend-platform';

import {
  render, within, screen, waitFor,
} from '../setupTest';
import { useCourseListSearch } from '../data/course-list-search/hooks';
import { mockCourseListSearchResponse } from '../__mocks__';
import CatalogPage from './CatalogPage';
import messages from './messages';

jest.mock('../data/course-list-search/hooks', () => ({
  useCourseListSearch: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  ErrorPage: ({ message }: { message: string }) => (
    <div data-testid="error-page">{message}</div>
  ),
}));

const mockUseCourseListSearch = useCourseListSearch as jest.Mock;
const mockGetConfig = getConfig as jest.Mock;

describe('CatalogPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfig.mockReturnValue({
      INFO_EMAIL: process.env.INFO_EMAIL,
      ENABLE_COURSE_DISCOVERY: process.env.ENABLE_COURSE_DISCOVERY,
    });
  });

  it('should show loading state', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    render(<CatalogPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: true,
      data: null,
    });

    render(<CatalogPage />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-danger');

    const errorPage = screen.getByTestId('error-page');
    expect(errorPage).toHaveTextContent(
      messages.errorMessage.defaultMessage.replace('{supportEmail}', getConfig().INFO_EMAIL),
    );
  });

  it('should show empty courses state', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        ...mockCourseListSearchResponse,
        results: [],
      },
    });

    render(<CatalogPage />);
    expect(screen.getByText(messages.exploreCourses.defaultMessage)).toBeInTheDocument();
    const infoAlert = screen.getByRole('alert');
    expect(within(infoAlert).getByText(messages.noCoursesAvailable.defaultMessage)).toBeInTheDocument();
    expect(within(infoAlert).getByText(messages.noCoursesAvailableMessage.defaultMessage)).toBeInTheDocument();
  });

  it('should render DataTable with correct configuration', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    render(<CatalogPage />);

    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Ukrainian')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
  });

  it('should render DataTable with filters when course discovery is enabled', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    render(<CatalogPage />);

    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText(messages.exploreCourses.defaultMessage)).toBeInTheDocument();
    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    expect(searchField).toBeInTheDocument();
  });

  it('should render DataTable without filters when course discovery is disabled', () => {
    mockGetConfig.mockReturnValue({
      INFO_EMAIL: 'support@example.com',
      ENABLE_COURSE_DISCOVERY: false,
    });

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    render(<CatalogPage />);

    expect(screen.queryByText('Language')).not.toBeInTheDocument();
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    expect(screen.getByText(messages.exploreCourses.defaultMessage)).toBeInTheDocument();
    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    expect(searchField).toBeInTheDocument();
  });

  it('should handle search field interactions', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    expect(searchField).toHaveValue('');
    expect(searchField).toBeInTheDocument();
  });

  it('should render DataTable row statuses with correct pagination info', async () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    render(<CatalogPage />);

    await waitFor(() => {
      const rowStatuses = screen.getAllByTestId('row-status');

      rowStatuses.forEach(rowStatus => {
        expect(rowStatus).toHaveTextContent(
          `Showing 1 - ${mockCourseListSearchResponse.results.length} of ${mockCourseListSearchResponse.total}.`,
        );
      });

      expect(rowStatuses.length).toBe(2);
    });
  });

  it('should render course cards with correct content', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    render(<CatalogPage />);
    expect(screen.getByText(messages.exploreCourses.defaultMessage)).toBeInTheDocument();

    const courseCards = screen.getAllByTestId('course-card');
    expect(courseCards.length).toBe(mockCourseListSearchResponse.results.length);

    mockCourseListSearchResponse.results.forEach((course, index) => {
      const courseCard = courseCards[index];

      expect(within(courseCard).getByText(course.data.content.displayName)).toBeInTheDocument();
      expect(within(courseCard).getByText(course.data.content.number)).toBeInTheDocument();
      expect(within(courseCard).getByText(course.data.org)).toBeInTheDocument();
      expect(courseCard).toHaveAttribute('href', `/courses/${course.data.course}/about`);
    });
  });
});
