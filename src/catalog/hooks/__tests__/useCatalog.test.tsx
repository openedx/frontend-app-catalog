import { MemoryRouter } from 'react-router-dom';

import { renderHook, act } from '@src/setupTest';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import { mockCourseListSearchResponse } from '@src/__mocks__';
import { useCatalog } from '../useCatalog';

const mockFetchData = jest.fn();

const mockCatalogData = mockCourseListSearchResponse;

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

  const withSearchQuery = (query: string | null) => {
    const params = new URLSearchParams();
    if (query) {
      params.set('search_query', query);
    }
    return [params, jest.fn()] as const;
  };

  it('should initialize with default state', () => {
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      catalogData: undefined,
      isFetching: false,
      searchParams,
      setSearchParams,
    }), {
      wrapper: createWrapper(),
    });

    expect(result.current.pageIndex).toBe(DEFAULT_PAGE_INDEX);
    expect(result.current.searchString).toBe('');
    expect(result.current.previousCatalogData).toBeNull();
    expect(result.current.filterState).toEqual({
      previousFilters: null,
      isFilterChangeInProgress: false,
    });
  });

  it('should handle search', () => {
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      catalogData: undefined,
      isFetching: false,
      searchParams,
      setSearchParams,
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
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      catalogData: undefined,
      isFetching: false,
      searchParams,
      setSearchParams,
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
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      catalogData: undefined,
      isFetching: false,
      searchParams,
      setSearchParams,
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
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      catalogData: undefined,
      isFetching: false,
      searchParams,
      setSearchParams,
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
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      catalogData: undefined,
      isFetching: false,
      searchParams,
      setSearchParams,
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
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      catalogData: undefined,
      isFetching: false,
      searchParams,
      setSearchParams,
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
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const initialData = { ...mockCatalogData };

    const { result, rerender } = renderHook(
      ({ catalogData, isFetching }: {
        catalogData: typeof mockCatalogData | undefined;
        isFetching: boolean,
      }) => useCatalog({
        fetchData: mockFetchData,
        catalogData,
        isFetching,
        searchParams,
        setSearchParams,
      }),
      {
        wrapper: createWrapper(),
        initialProps: {
          catalogData: initialData,
          isFetching: false,
        },
      },
    );

    expect(result.current.previousCatalogData).toEqual(initialData);
    expect(result.current.searchString).toBe('');

    act(() => {
      result.current.handleSearch('python');
    });

    expect(result.current.searchString).toBe('python');

    const newCourseData = { ...mockCatalogData, total: 99 };
    rerender({
      catalogData: newCourseData,
      isFetching: false,
    });

    expect(result.current.previousCatalogData).toEqual(initialData);
  });

  it('should reset filter progress', () => {
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      catalogData: undefined,
      isFetching: false,
      searchParams,
      setSearchParams,
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
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useCatalog({
      fetchData: mockFetchData,
      catalogData: mockCatalogData,
      isFetching: false,
      searchParams,
      setSearchParams,
    }), {
      wrapper: createWrapper(),
    });

    expect(result.current.pageIndex).toBe(DEFAULT_PAGE_INDEX);
    expect(result.current.searchString).toBe('');
    expect(result.current.previousCatalogData).toEqual(mockCatalogData);
    expect(result.current.filterState).toEqual({
      previousFilters: null,
      isFilterChangeInProgress: false,
    });
  });
});
