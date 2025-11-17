import { MemoryRouter } from 'react-router-dom';

import { renderHook, act } from '@src/setupTest';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import { mockCourseListSearchResponse } from '@src/__mocks__';
import { useCatalog } from '../useCatalog';

const mockFetchData = jest.fn();

const mockCourseData = {
  ...mockCourseListSearchResponse,
  results: mockCourseListSearchResponse.results.map(result => ({
    ...result,
    title: result.data.content.displayName,
  })),
};

const createWrapper = () => function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      {children}
    </MemoryRouter>
  );
};

describe('useCatalog', () => {
  beforeEach(() => {
    mockFetchData.mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      courseData: undefined,
      isFetching: false,
    }), {
      wrapper: createWrapper(),
    });

    expect(result.current.pageIndex).toBe(DEFAULT_PAGE_INDEX);
    expect(result.current.searchString).toBe('');
    expect(result.current.previousCourseData).toBeNull();
    expect(result.current.filterState).toEqual({
      previousFilters: null,
      isFilterChangeInProgress: false,
    });
  });

  it('should handle search', () => {
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      courseData: undefined,
      isFetching: false,
    }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleSearch('javascript');
    });

    expect(result.current.searchString).toBe('javascript');
    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: 'javascript',
    });
  });

  it('should clear search when submitting empty value', () => {
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      courseData: undefined,
      isFetching: false,
    }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleSearch('javascript');
    });

    expect(result.current.searchString).toBe('javascript');

    act(() => {
      result.current.handleSearch('');
    });

    expect(result.current.searchString).toBe('');
    expect(mockFetchData).toHaveBeenNthCalledWith(2, {
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: '',
    });
  });

  it('should handle filter changes', () => {
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      courseData: undefined,
      isFetching: false,
    }), {
      wrapper: createWrapper(),
    });

    const newFilters = [{ id: 'subject', value: 'math' }];

    act(() => {
      result.current.handleFetchData({
        pageIndex: DEFAULT_PAGE_INDEX,
        pageSize: DEFAULT_PAGE_SIZE,
        filters: newFilters,
      });
    });

    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: newFilters,
      searchString: '',
    });
  });

  it('should handle pagination changes', () => {
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      courseData: undefined,
      isFetching: false,
    }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleFetchData({
        pageIndex: 2,
        pageSize: DEFAULT_PAGE_SIZE,
        filters: [],
      });
    });

    expect(result.current.pageIndex).toBe(2);
    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: 2,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: '',
    });
  });

  it('should reset pagination when filters change', () => {
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      courseData: undefined,
      isFetching: false,
    }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleFetchData({
        pageIndex: 2,
        pageSize: DEFAULT_PAGE_SIZE,
        filters: [],
      });
    });

    expect(result.current.pageIndex).toBe(2);

    act(() => {
      result.current.handleFetchData({
        pageIndex: DEFAULT_PAGE_INDEX,
        pageSize: DEFAULT_PAGE_SIZE,
        filters: [{ id: 'subject', value: 'math' }],
      });
    });

    expect(result.current.pageIndex).toBe(0);
  });

  it('should include current search string when fetching data', () => {
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      courseData: undefined,
      isFetching: false,
    }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleSearch('javascript');
    });

    mockFetchData.mockClear();

    act(() => {
      result.current.handleFetchData({
        pageIndex: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        filters: [],
      });
    });

    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: 'javascript',
    });
  });

  it('should keep cached data unchanged while a search is active', () => {
    const initialData = { ...mockCourseData };

    const { result, rerender } = renderHook(
      ({ courseData, isFetching }: {
        courseData: typeof mockCourseData | undefined;
        isFetching: boolean,
      }) => useCatalog({
        fetchData: mockFetchData,
        courseData,
        isFetching,
      }),
      {
        wrapper: createWrapper(),
        initialProps: {
          courseData: initialData,
          isFetching: false,
        },
      },
    );

    expect(result.current.previousCourseData).toEqual(initialData);
    expect(result.current.searchString).toBe('');

    act(() => {
      result.current.handleSearch('python');
    });

    expect(result.current.searchString).toBe('python');

    const newCourseData = { ...mockCourseData, total: 99 };
    rerender({
      courseData: newCourseData,
      isFetching: false,
    });

    expect(result.current.previousCourseData).toEqual(initialData);
  });

  it('should reset filter progress', () => {
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      courseData: undefined,
      isFetching: false,
    }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleFetchData({
        pageIndex: DEFAULT_PAGE_INDEX,
        pageSize: DEFAULT_PAGE_SIZE,
        filters: [{ id: 'subject', value: 'math' }],
      });
    });

    expect(result.current.filterState.isFilterChangeInProgress).toBe(true);

    act(() => {
      result.current.resetFilterProgress();
    });

    expect(result.current.filterState.isFilterChangeInProgress).toBe(false);
  });

  it('should initialize with course data when provided', () => {
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      courseData: mockCourseData,
      isFetching: false,
    }), {
      wrapper: createWrapper(),
    });

    expect(result.current.pageIndex).toBe(DEFAULT_PAGE_INDEX);
    expect(result.current.searchString).toBe('');
    expect(result.current.previousCourseData).toEqual(mockCourseData);
    expect(result.current.filterState).toEqual({
      previousFilters: null,
      isFilterChangeInProgress: false,
    });
  });
});
