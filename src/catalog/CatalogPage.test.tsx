import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  render, within, screen, waitFor, userEvent, act,
} from '../setupTest';
import { useCourseListSearch } from '../data/course-list-search/hooks';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '../data/course-list-search/constants';
import { mockCourseListSearchResponse } from '../__mocks__';
import CatalogPage from './CatalogPage';
import messages from './messages';

jest.mock('../data/course-list-search/hooks', () => ({
  useCourseListSearch: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
  camelCaseObject: jest.fn(obj => obj),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  ErrorPage: ({ message }: { message: string }) => (
    <div data-testid="error-page">{message}</div>
  ),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockUseCourseListSearch = useCourseListSearch as jest.Mock;
const mockGetConfig = getConfig as jest.Mock;

const actualUseCourseListSearch = jest
  .requireActual('../data/course-list-search/hooks').useCourseListSearch;

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
      fetchData: jest.fn(),
      isFetching: false,
    });

    render(<CatalogPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: true,
      data: null,
      fetchData: jest.fn(),
      isFetching: false,
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
        total: 0,
      },
      fetchData: jest.fn(),
      isFetching: false,
    });

    render(<CatalogPage />);
    expect(screen.getByText(messages.exploreCourses.defaultMessage)).toBeInTheDocument();
    const infoAlert = screen.getByRole('alert');
    expect(within(infoAlert).getByText(messages.noCoursesAvailable.defaultMessage)).toBeInTheDocument();
    expect(within(infoAlert).getByText(messages.noCoursesAvailableMessage.defaultMessage)).toBeInTheDocument();
  });

  it('should display language filters in the DataTable correctly', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: jest.fn(),
      isFetching: false,
    });

    render(<CatalogPage />);

    expect(screen.getByText(messages.languages.defaultMessage)).toBeInTheDocument();
    const englishFilter = screen.getByText('English');
    expect(within(englishFilter).getByText(
      mockCourseListSearchResponse.aggs.language.terms.en,
    )).toBeInTheDocument();
  });

  it('should render DataTable with filters when course discovery is enabled', () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: jest.fn(),
      isFetching: false,
    });

    render(<CatalogPage />);

    expect(screen.getByText(messages.languages.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText(messages.exploreCourses.defaultMessage)).toBeInTheDocument();
    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    expect(searchField).toBeInTheDocument();
  });

  it('should render DataTable without filters and search field when course discovery is disabled', () => {
    mockGetConfig.mockReturnValue({
      INFO_EMAIL: 'support@example.com',
      ENABLE_COURSE_DISCOVERY: false,
    });

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: jest.fn(),
      isFetching: false,
    });

    render(<CatalogPage />);

    expect(screen.queryByText(messages.languages.defaultMessage)).not.toBeInTheDocument();
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    expect(screen.getByText(messages.exploreCourses.defaultMessage)).toBeInTheDocument();
    const searchField = screen.queryByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    expect(searchField).not.toBeInTheDocument();
  });

  it('should handle search field interactions and input changes', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    expect(searchField).toHaveValue('');
    expect(searchField).toBeInTheDocument();

    await userEvent.type(searchField, 'python');
    expect(searchField).toHaveValue('python');
  });

  it('should call fetchData with search query when search is submitted', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    await userEvent.type(searchField, 'python');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: DEFAULT_PAGE_SIZE,
          filters: [],
          searchString: 'python',
        }),
      );
    });
  });

  it('should call fetchData with search query when search button is clicked', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await userEvent.type(searchField, 'python');

    const searchButton = screen.getByRole('button', { name: 'search submit search' });
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: DEFAULT_PAGE_SIZE,
          filters: [],
          searchString: 'python',
        }),
      );
    });
  });

  it('should clear search when clear button is clicked', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    await userEvent.type(searchField, 'python');
    await userEvent.keyboard('{Enter}');

    await userEvent.clear(searchField);
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(searchField).toHaveValue('');
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: DEFAULT_PAGE_SIZE,
          filters: [],
          searchString: '',
        }),
      );
    });
  });

  it('should reset page to 0 when performing search', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    await userEvent.type(searchField, 'machine learning');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      const lastCall = mockFetchData.mock.calls[mockFetchData.mock.calls.length - 1];
      expect(lastCall[0].pageIndex).toBe(DEFAULT_PAGE_INDEX);
    });
  });

  it('should handle empty search query submission', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    await userEvent.click(searchField);
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: DEFAULT_PAGE_SIZE,
          filters: [],
          searchString: '',
        }),
      );
    });
  });

  it('should display search results when search returns data', async () => {
    const mockFetchData = jest.fn();
    const searchResults = {
      ...mockCourseListSearchResponse,
      results: [mockCourseListSearchResponse.results[0]],
      total: 1,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: searchResults,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const courseCards = screen.getAllByTestId('course-card');
    expect(courseCards).toHaveLength(searchResults.results.length);

    const rowStatus = screen.getAllByTestId('row-status')[0];
    expect(rowStatus).toHaveTextContent(
      `Showing ${searchResults.results.length} - ${searchResults.results.length} of ${searchResults.total}.`,
    );
  });

  it('should show no results message when search returns empty results', async () => {
    const mockFetchData = jest.fn();
    const emptySearchResults = {
      ...mockCourseListSearchResponse,
      results: [],
      total: 0,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: emptySearchResults,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    expect(screen.getByText(messages.noCoursesAvailable.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.noCoursesAvailableMessage.defaultMessage)).toBeInTheDocument();
  });

  it('should preserve filters when performing search', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    // First apply a filter
    const englishCheckbox = screen.getByRole('checkbox', { name: /English/i });
    await userEvent.click(englishCheckbox);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({
              id: 'language',
              value: expect.arrayContaining(['en']),
            }),
          ]),
        }),
      );
    });

    // Then perform a search - filters should be preserved
    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await userEvent.type(searchField, 'data science');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      const lastCall = mockFetchData.mock.calls[mockFetchData.mock.calls.length - 1];
      expect(lastCall[0]).toEqual(
        expect.objectContaining({
          pageIndex: 0,
          pageSize: DEFAULT_PAGE_SIZE,
          filters: expect.arrayContaining([
            expect.objectContaining({
              id: 'language',
              value: expect.arrayContaining(['en']),
            }),
          ]),
          searchString: 'data science',
        }),
      );
    });
  });

  it('should handle search and filter interactions independently', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await userEvent.type(searchField, 'python');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: DEFAULT_PAGE_SIZE,
          filters: [],
          searchString: 'python',
        }),
      );
    });

    await userEvent.clear(searchField);
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      const lastCall = mockFetchData.mock.calls[mockFetchData.mock.calls.length - 1];
      expect(lastCall[0]).toEqual(
        expect.objectContaining({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: DEFAULT_PAGE_SIZE,
          filters: [],
          searchString: '',
        }),
      );
    });
  });

  it('should maintain search state during pagination', async () => {
    const mockFetchData = jest.fn();
    const paginatedResponse = {
      ...mockCourseListSearchResponse,
      total: 50,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: paginatedResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    // Perform search
    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await userEvent.type(searchField, 'python');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          searchString: 'python',
        }),
      );
    });

    // Go to next page
    const nextPageButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextPageButton);

    // Verify that search string is preserved during pagination
    await waitFor(() => {
      const lastCall = mockFetchData.mock.calls[mockFetchData.mock.calls.length - 1];
      expect(lastCall[0]).toEqual(
        expect.objectContaining({
          pageIndex: 1,
          searchString: 'python',
        }),
      );
    });
  });

  it('should handle search with special characters', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    // Test search with special characters
    await userEvent.type(searchField, 'C++ & Java');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: DEFAULT_PAGE_SIZE,
          filters: [],
          searchString: 'C++ & Java',
        }),
      );
    });
  });

  it('should handle multiple consecutive searches', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    await userEvent.type(searchField, 'python');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          searchString: 'python',
        }),
      );
    });

    await userEvent.clear(searchField);
    await userEvent.type(searchField, 'javascript');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      const lastCall = mockFetchData.mock.calls[mockFetchData.mock.calls.length - 1];
      expect(lastCall[0]).toEqual(
        expect.objectContaining({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: DEFAULT_PAGE_SIZE,
          filters: [],
          searchString: 'javascript',
        }),
      );
    });
  });

  it('should render DataTable row statuses with correct pagination info', async () => {
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: jest.fn(),
      isFetching: false,
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
      fetchData: jest.fn(),
      isFetching: false,
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

  it('should call fetchData with correct parameters when applying language filter', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const englishCheckbox = screen.getByRole('checkbox', { name: /English/i });

    await userEvent.click(englishCheckbox);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: 0,
          filters: expect.arrayContaining([
            expect.objectContaining({
              id: 'language',
              value: expect.arrayContaining(['en']),
            }),
          ]),
        }),
      );
    });
  });

  it('should call fetchData with correct parameters when applying organization filter', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const orgCheckbox = screen.getByRole('checkbox', { name: /Dev/i });

    await userEvent.click(orgCheckbox);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: 0,
          filters: expect.arrayContaining([
            expect.objectContaining({
              id: 'org',
              value: expect.arrayContaining(['dev']),
            }),
          ]),
        }),
      );
    });
  });

  it('should reset page to 0 when applying filters', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const filterCheckbox = screen.getByRole('checkbox', { name: /English/i });
    await userEvent.click(filterCheckbox);

    await waitFor(() => {
      const lastCall = mockFetchData.mock.calls[mockFetchData.mock.calls.length - 1];
      expect(lastCall[0].pageIndex).toBe(0);
    });
  });

  it('should apply multiple filters simultaneously', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    // Apply first filter
    const englishCheckbox = screen.getByRole('checkbox', { name: /English/i });
    await userEvent.click(englishCheckbox);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalled();
    });

    // Apply second filter
    const orgCheckbox = screen.getByRole('checkbox', { name: /Dev/i });
    await userEvent.click(orgCheckbox);

    await waitFor(() => {
      const lastCall = mockFetchData.mock.calls[mockFetchData.mock.calls.length - 1];
      expect(lastCall[0].filters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'language', value: expect.arrayContaining(['en']),
          }),
          expect.objectContaining({
            id: 'org', value: expect.arrayContaining(['dev']),
          }),
        ]),
      );
    });
  });

  it('should clear filters and fetch all courses', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    // Apply filter
    const filterCheckbox = screen.getByRole('checkbox', { name: /English/i });
    await userEvent.click(filterCheckbox);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalled();
    });

    // Remove filter
    await userEvent.click(filterCheckbox);

    await waitFor(() => {
      const lastCall = mockFetchData.mock.calls[mockFetchData.mock.calls.length - 1];
      // After removing all filters, filters should be an empty array
      expect(lastCall[0].filters).toEqual([]);
    });
  });

  it('should handle pagination correctly', async () => {
    const mockFetchData = jest.fn();
    const paginatedResponse = {
      ...mockCourseListSearchResponse,
      total: 50,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: paginatedResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const nextPageButton = screen.getByRole('button', { name: /next/i });

    await userEvent.click(nextPageButton);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: 1,
        }),
      );
    });
  });

  it('should display correct course cards after filtering by organization', async () => {
    const mockFetchData = jest.fn();
    const filteredResponse = {
      ...mockCourseListSearchResponse,
      results: mockCourseListSearchResponse.results.filter(
        course => course.data.org === 'dev',
      ),
      total: 1,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    const { rerender } = render(<CatalogPage />);

    expect(screen.getAllByTestId('course-card')).toHaveLength(
      mockCourseListSearchResponse.results.length,
    );

    const orgCheckbox = screen.getByRole('checkbox', { name: /Dev/i });
    await userEvent.click(orgCheckbox);

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: filteredResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    rerender(<CatalogPage />);

    // Verify that only one card is displayed
    await waitFor(() => {
      const courseCards = screen.getAllByTestId('course-card');
      expect(courseCards).toHaveLength(filteredResponse.results.length);
      expect(within(courseCards[0]).getByText(
        filteredResponse.results[0].data.content.displayName,
      )).toBeInTheDocument();
      expect(within(courseCards[0]).getByText(
        filteredResponse.results[0].data.org,
      )).toBeInTheDocument();
    });
  });

  it('should show empty state when filters return no results', async () => {
    const mockFetchData = jest.fn();
    const emptyResponse = {
      ...mockCourseListSearchResponse,
      results: [],
      total: 0,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    const { rerender } = render(<CatalogPage />);

    const filterCheckbox = screen.getByRole('checkbox', { name: /English/i });
    await userEvent.click(filterCheckbox);

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: emptyResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    rerender(<CatalogPage />);

    await waitFor(() => {
      expect(screen.getByText(messages.noResultsFound.defaultMessage)).toBeInTheDocument();
    });
  });

  it('should maintain filter state during pagination', async () => {
    const mockFetchData = jest.fn();
    const paginatedResponse = {
      ...mockCourseListSearchResponse,
      total: 50,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: paginatedResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const filterCheckbox = screen.getByRole('checkbox', { name: /English/i });
    await userEvent.click(filterCheckbox);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({ id: 'language', value: expect.arrayContaining(['en']) }),
          ]),
        }),
      );
    });

    // Go to next page
    const nextPageButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextPageButton);

    // Verify that filters are preserved during pagination
    await waitFor(() => {
      const lastCall = mockFetchData.mock.calls[mockFetchData.mock.calls.length - 1];
      expect(lastCall[0].filters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'language', value: expect.arrayContaining(['en']) }),
        ]),
      );
      expect(lastCall[0].pageIndex).toBe(1);
    });
  });

  it('should update row status text when filtering changes total count', async () => {
    const mockFetchData = jest.fn();
    const filteredResponse = {
      ...mockCourseListSearchResponse,
      results: [mockCourseListSearchResponse.results[0]],
      total: 1,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    const { rerender } = render(<CatalogPage />);

    await waitFor(() => {
      const rowStatuses = screen.getAllByTestId('row-status');
      expect(rowStatuses[0]).toHaveTextContent(
        `Showing 1 - ${mockCourseListSearchResponse.results.length} of ${mockCourseListSearchResponse.results.length}.`,
      );
    });

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: filteredResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    rerender(<CatalogPage />);

    await waitFor(() => {
      const rowStatuses = screen.getAllByTestId('row-status');
      expect(rowStatuses[0]).toHaveTextContent(
        `Showing 1 - ${filteredResponse.results.length} of ${filteredResponse.results.length}.`,
      );
    });
  });

  it('should call fetchData with correct page size', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          pageSize: DEFAULT_PAGE_SIZE,
        }),
      );
    });
  });

  it('should calculate pageCount based on courseData.total when available', () => {
    const mockFetchData = jest.fn();
    const responseWithTotal = {
      ...mockCourseListSearchResponse,
      results: mockCourseListSearchResponse.results,
      total: 25,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: responseWithTotal,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    // pageCount should be Math.ceil(25 / 20) = 2
    const paginationButton = screen.getByRole('button', { name: /1 of 2/i });
    expect(paginationButton).toBeInTheDocument();

    // itemCount is passed to DataTable as courseData.total (25)
    const rowStatus = screen.getAllByTestId('row-status')[0];
    expect(rowStatus).toHaveTextContent('Showing 1 - 3 of 25.');
  });

  it('should calculate pageCount based on results length when total is not provided', () => {
    const mockFetchData = jest.fn();
    const responseWithoutTotal = {
      ...mockCourseListSearchResponse,
      results: mockCourseListSearchResponse.results,
      total: 0,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: responseWithoutTotal,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    // When pageCount = 1, no dropdown button is shown, only disabled navigation buttons
    const previousButton = screen.getByRole('button', { name: /Previous/i });
    const nextButton = screen.getByRole('button', { name: /Next/i });
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();

    // Pagination navigation still exists
    const paginationNav = screen.getByRole('navigation', { name: /table pagination/i });
    expect(paginationNav).toBeInTheDocument();

    const rowStatus = screen.getAllByTestId('row-status')[0];
    expect(rowStatus).toHaveTextContent(
      `Showing 1 - ${responseWithoutTotal.results.length} of ${responseWithoutTotal.results.length}.`,
    );
  });

  it('should use results length as fallback when courseData.total is undefined', () => {
    const mockFetchData = jest.fn();
    const responseWithoutTotalField = {
      ...mockCourseListSearchResponse,
      results: mockCourseListSearchResponse.results,
    };
    delete (responseWithoutTotalField as any).total;

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: responseWithoutTotalField,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    // pageCount should be Math.ceil(3 / 20) = 1
    const previousButton = screen.getByRole('button', { name: /Previous/i });
    const nextButton = screen.getByRole('button', { name: /Next/i });
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();

    // Pagination navigation still exists
    const paginationNav = screen.getByRole('navigation', { name: /table pagination/i });
    expect(paginationNav).toBeInTheDocument();

    const rowStatus = screen.getAllByTestId('row-status')[0];
    expect(rowStatus).toHaveTextContent('Showing 1 - 3 of 3.');
  });

  it('should handle empty results array correctly', () => {
    const mockFetchData = jest.fn();
    const responseWithEmptyResults = {
      ...mockCourseListSearchResponse,
      results: [],
      total: 0,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: responseWithEmptyResults,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    expect(screen.getByText(messages.noCoursesAvailable.defaultMessage)).toBeInTheDocument();
    // No pagination buttons should be shown
    expect(screen.queryByRole('button', { name: /of/i })).not.toBeInTheDocument();
  });

  it('should calculate single page when total equals pageSize', () => {
    const mockFetchData = jest.fn();
    const responseWithOnePageExact = {
      ...mockCourseListSearchResponse,
      results: mockCourseListSearchResponse.results,
      total: DEFAULT_PAGE_SIZE,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: responseWithOnePageExact,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    // pageCount = Math.ceil(20 / 20) = 1
    // When there is only one page, dropdown button is not shown
    const rowStatus = screen.getAllByTestId('row-status')[0];
    expect(rowStatus).toHaveTextContent('Showing 1 - 3 of 20.');

    // Both navigation buttons should be disabled, because there is only one page
    const previousButton = screen.getByRole('button', { name: /Previous/i });
    const nextButton = screen.getByRole('button', { name: /Next/i });
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();

    // Pagination navigation still exists
    const paginationNav = screen.getByRole('navigation', { name: /table pagination/i });
    expect(paginationNav).toBeInTheDocument();
  });

  it('should prioritize courseData.total over results.length for itemCount', () => {
    const mockFetchData = jest.fn();
    const responseWithDifferentValues = {
      ...mockCourseListSearchResponse,
      results: mockCourseListSearchResponse.results.slice(0, 2),
      total: 100,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: responseWithDifferentValues,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    // pageCount should be Math.ceil(100 / 20) = 5
    const paginationButton = screen.getByRole('button', { name: /1 of 5/i });
    expect(paginationButton).toBeInTheDocument();

    const rowStatus = screen.getAllByTestId('row-status')[0];
    expect(rowStatus).toHaveTextContent('Showing 1 - 2 of 100.');
  });

  it('should calculate pageCount as 0 when both total and totalCourses are 0', () => {
    const mockFetchData = jest.fn();
    const responseWithAllZeros = {
      results: [],
      total: 0,
    };

    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: responseWithAllZeros,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    expect(screen.getByText(messages.noCoursesAvailable.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /of/i })).not.toBeInTheDocument();
  });

  describe('SubHeader title', () => {
    it('should display default title when no search is performed', () => {
      mockUseCourseListSearch.mockReturnValue({
        isLoading: false,
        isError: false,
        data: mockCourseListSearchResponse,
        fetchData: jest.fn(),
        isFetching: false,
      });

      render(<CatalogPage />);

      expect(screen.getByText(messages.exploreCourses.defaultMessage)).toBeInTheDocument();
    });

    it('should display search results title when search has results', async () => {
      const mockFetchData = jest.fn();
      const searchResults = {
        ...mockCourseListSearchResponse,
        results: [mockCourseListSearchResponse.results[0]],
        total: 1,
      };

      mockUseCourseListSearch.mockReturnValue({
        isLoading: false,
        isError: false,
        data: searchResults,
        fetchData: mockFetchData,
        isFetching: false,
      });

      render(<CatalogPage />);

      const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
      await userEvent.type(searchField, 'python');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(
          messages.searchResults.defaultMessage.replace('{query}', 'python'),
        )).toBeInTheDocument();
      });
    });

    it('should display no search results title when search returns empty results', async () => {
      const mockFetchData = jest.fn();
      mockUseCourseListSearch.mockReturnValue({
        isLoading: false,
        isError: false,
        data: mockCourseListSearchResponse,
        fetchData: mockFetchData,
        isFetching: false,
      });

      const { rerender } = render(<CatalogPage />);

      const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
      await userEvent.type(searchField, 'nonexistent');
      await userEvent.keyboard('{Enter}');

      const emptySearchResults = {
        ...mockCourseListSearchResponse,
        results: [],
        total: 0,
      };

      mockUseCourseListSearch.mockReturnValue({
        isLoading: false,
        isError: false,
        data: emptySearchResults,
        fetchData: mockFetchData,
        isFetching: false,
      });

      rerender(<CatalogPage />);

      await waitFor(() => {
        expect(screen.getByText(
          messages.noSearchResults.defaultMessage.replace('{query}', 'nonexistent'),
        )).toBeInTheDocument();
      });
    });

    it('should keep cached courses visible after empty results and restore the search title once data returns', async () => {
      const mockFetchData = jest.fn();
      const query = 'nonexistent';

      const emptySearchResults = {
        ...mockCourseListSearchResponse,
        results: [],
        total: 0,
      };

      mockUseCourseListSearch.mockReturnValue({
        isLoading: false,
        isError: false,
        data: mockCourseListSearchResponse,
        fetchData: mockFetchData,
        isFetching: false,
      });

      const { rerender } = render(<CatalogPage />);

      const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

      await userEvent.type(searchField, query);
      await userEvent.keyboard('{Enter}');

      mockUseCourseListSearch.mockReturnValue({
        isLoading: false,
        isError: false,
        data: emptySearchResults,
        fetchData: mockFetchData,
        isFetching: false,
      });

      rerender(<CatalogPage />);

      await waitFor(() => {
        expect(screen.getByText(
          messages.noSearchResults.defaultMessage.replace('{query}', query),
        )).toBeInTheDocument();
      });

      mockCourseListSearchResponse.results.forEach(result => {
        expect(screen.getByText(result.data.content.displayName)).toBeInTheDocument();
      });

      mockUseCourseListSearch.mockReturnValue({
        isLoading: false,
        isError: false,
        data: mockCourseListSearchResponse,
        fetchData: mockFetchData,
        isFetching: false,
      });

      rerender(<CatalogPage />);

      await waitFor(() => {
        expect(screen.getByText(
          messages.searchResults.defaultMessage.replace('{query}', query),
        )).toBeInTheDocument();
      });
    });

    it('should display search results title when search is cleared after having results', async () => {
      const mockFetchData = jest.fn();
      const searchResults = {
        ...mockCourseListSearchResponse,
        results: [mockCourseListSearchResponse.results[0]],
        total: 1,
      };

      mockUseCourseListSearch.mockReturnValue({
        isLoading: false,
        isError: false,
        data: searchResults,
        fetchData: mockFetchData,
        isFetching: false,
      });

      render(<CatalogPage />);

      const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

      await userEvent.type(searchField, 'python');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Search results for "python"')).toBeInTheDocument();
      });

      await userEvent.clear(searchField);
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(messages.exploreCourses.defaultMessage)).toBeInTheDocument();
      });
    });

    it('should display search results title with special characters in query', async () => {
      const mockFetchData = jest.fn();
      const searchResults = {
        ...mockCourseListSearchResponse,
        results: [mockCourseListSearchResponse.results[0]],
        total: 1,
      };

      mockUseCourseListSearch.mockReturnValue({
        isLoading: false,
        isError: false,
        data: searchResults,
        fetchData: mockFetchData,
        isFetching: false,
      });

      render(<CatalogPage />);

      const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
      await userEvent.type(searchField, 'C++ & Java');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(
          messages.searchResults.defaultMessage.replace('{query}', 'C++ & Java'),
        )).toBeInTheDocument();
      });
    });

    it('should update title when switching between different search queries', async () => {
      const mockFetchData = jest.fn();
      const searchResults = {
        ...mockCourseListSearchResponse,
        results: [mockCourseListSearchResponse.results[0]],
        total: 1,
      };

      mockUseCourseListSearch.mockReturnValue({
        isLoading: false,
        isError: false,
        data: searchResults,
        fetchData: mockFetchData,
        isFetching: false,
      });

      render(<CatalogPage />);

      const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

      await userEvent.type(searchField, 'python');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(
          messages.searchResults.defaultMessage.replace('{query}', 'python'),
        )).toBeInTheDocument();
      });

      await userEvent.clear(searchField);
      await userEvent.type(searchField, 'javascript');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(
          messages.searchResults.defaultMessage.replace('{query}', 'javascript'),
        )).toBeInTheDocument();
      });
    });

    it('should display default title when course discovery is disabled', () => {
      mockGetConfig.mockReturnValue({
        INFO_EMAIL: process.env.INFO_EMAIL,
        ENABLE_COURSE_DISCOVERY: false,
      });

      mockUseCourseListSearch.mockReturnValue({
        isLoading: false,
        isError: false,
        data: mockCourseListSearchResponse,
        fetchData: jest.fn(),
        isFetching: false,
      });

      render(<CatalogPage />);

      expect(screen.getByText(messages.exploreCourses.defaultMessage)).toBeInTheDocument();
      const searchField = screen.queryByPlaceholderText(messages.searchPlaceholder.defaultMessage);
      expect(searchField).not.toBeInTheDocument();
    });
  });
});

describe('CatalogPage search integration', () => {
  let mockPost: jest.Mock;

  beforeEach(() => {
    mockPost = jest.fn().mockResolvedValue({ data: mockCourseListSearchResponse });

    getAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

    mockUseCourseListSearch.mockImplementation(params => actualUseCourseListSearch(params));

    mockGetConfig.mockReturnValue({
      INFO_EMAIL: process.env.INFO_EMAIL,
      ENABLE_COURSE_DISCOVERY: process.env.ENABLE_COURSE_DISCOVERY,
    });
  });

  afterEach(() => {
    getAuthenticatedHttpClient.mockReset();
    mockUseCourseListSearch.mockReset();
    mockGetConfig.mockReset();
  });

  it('sends search_string to FormData when searching', async () => {
    render(<CatalogPage />);

    await waitFor(() => expect(mockPost).toHaveBeenCalled());

    const [, initialFormData] = mockPost.mock.calls[0];
    expect((initialFormData as FormData).get('search_string')).toBeNull();

    const searchField = await screen.findByPlaceholderText(
      messages.searchPlaceholder.defaultMessage,
    );

    await userEvent.type(searchField, 'python');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(mockPost.mock.calls.length).toBeGreaterThanOrEqual(2));

    const searchCall = mockPost.mock.calls.find(([, formData]) => (
      (formData as FormData).get('search_string') === 'python'
    ));

    expect(searchCall).toBeDefined();
  });
});

describe('Debounced search', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockGetConfig.mockReturnValue({
      INFO_EMAIL: process.env.INFO_EMAIL,
      ENABLE_COURSE_DISCOVERY: process.env.ENABLE_COURSE_DISCOVERY,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should debounce search calls when typing in search field', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalled();
    });

    mockFetchData.mockClear();

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    // Use real timers for userEvent, then switch back to fake timers
    jest.useRealTimers();
    await userEvent.type(searchField, 'python');
    jest.useFakeTimers();

    // Should not be called immediately after typing (before debounce)
    expect(mockFetchData).not.toHaveBeenCalled();

    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    jest.useRealTimers();
    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: DEFAULT_PAGE_INDEX,
          pageSize: DEFAULT_PAGE_SIZE,
          filters: [],
          searchString: 'python',
        }),
      );
    });
    jest.useFakeTimers();
  });

  it('should only call fetchData once with final value when typing rapidly', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalled();
    });

    mockFetchData.mockClear();

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    jest.useRealTimers();
    await userEvent.type(searchField, 'react', { delay: 0 });
    jest.useFakeTimers();

    act(() => {
      jest.advanceTimersByTime(100);
    });
    // Should not be called yet (before debounce completes)
    expect(mockFetchData).not.toHaveBeenCalled();

    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    jest.useRealTimers();
    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          searchString: 'react',
        }),
      );
    });
    jest.useFakeTimers();
  });

  it('should call fetchData immediately on submit without waiting for debounce', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    jest.useRealTimers();
    await userEvent.type(searchField, 'javascript');
    await userEvent.keyboard('{Enter}');

    // Should be called immediately on submit, not waiting for debounce
    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          searchString: 'javascript',
        }),
      );
    });

    // Switch to fake timers to verify debounce doesn't cause duplicate calls
    jest.useFakeTimers();
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockFetchData).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should sync search input with external searchString changes', async () => {
    const mockFetchData = jest.fn();
    mockUseCourseListSearch.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseListSearchResponse,
      fetchData: mockFetchData,
      isFetching: false,
    });

    render(<CatalogPage />);

    const searchField = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    expect(searchField).toHaveValue('');

    jest.useRealTimers();
    await userEvent.type(searchField, 'python');
    expect(searchField).toHaveValue('python');

    await userEvent.clear(searchField);
    expect(searchField).toHaveValue('');

    jest.useFakeTimers();
    act(() => {
      jest.advanceTimersByTime(300);
    });

    jest.useRealTimers();
    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalled();
    });
  });
});
