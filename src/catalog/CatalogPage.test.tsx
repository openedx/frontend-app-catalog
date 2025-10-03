import { render, within, screen } from '../setupTest';
import { useCourseListSearch } from '../data/course-list-search/hooks';
import { mockCourseListSearchResponse } from '../__mocks__';
import CatalogPage from './CatalogPage';
import messages from './messages';

jest.mock('../data/course-list-search/hooks', () => ({
  useCourseListSearch: jest.fn(),
}));

const mockUseCourseListSearch = useCourseListSearch as jest.Mock;

describe('CatalogPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should show loading state', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    render(<CatalogPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
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
    expect(screen.getByText(messages.totalCoursesHeading.defaultMessage.replace('{totalCourses}', 0))).toBeInTheDocument();
    const infoAlert = screen.getByRole('alert');
    expect(within(infoAlert).getByText(messages.noCoursesAvailable.defaultMessage)).toBeInTheDocument();
    expect(within(infoAlert).getByText(messages.noCoursesAvailableMessage.defaultMessage)).toBeInTheDocument();
  });

  it('should display courses when data is available', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
    });

    render(<CatalogPage />);
    expect(screen.getByText(
      messages.totalCoursesHeading.defaultMessage.replace('{totalCourses}', mockCourseListSearchResponse.results.length),
    )).toBeInTheDocument();

    // Verify all courses are displayed
    mockCourseListSearchResponse.results.forEach(course => {
      expect(screen.getByText(course.data.content.displayName)).toBeInTheDocument();
    });
  });
});
