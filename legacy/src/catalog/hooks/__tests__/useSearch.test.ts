import { useSearchParams } from 'react-router-dom';

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import { renderHook, act, waitFor } from '@src/setupTest';
import { useSearch } from '../useSearch';

jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
}));

const mockFetchData = jest.fn();
const mockSetSearchParams = jest.fn();

const withSearchQuery = (query: string | null) => {
  const params = new URLSearchParams();
  if (query) {
    params.set('search_query', query);
  }
  return [params, mockSetSearchParams] as const;
};

describe('useSearch', () => {
  beforeEach(() => {
    mockFetchData.mockClear();
    mockSetSearchParams.mockClear();
    (useSearchParams as jest.Mock).mockReturnValue(withSearchQuery(null));
  });

  it('should initialize with empty search state', () => {
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useSearch({
      fetchData: mockFetchData,
      isFetching: false,
      searchParams,
      setSearchParams,
    }));

    expect(result.current.searchString).toBe('');
  });

  it('should handle search without updating URL', () => {
    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useSearch({
      fetchData: mockFetchData,
      isFetching: false,
      searchParams,
      setSearchParams,
    }));

    act(() => {
      result.current.handleSearch('javascript');
    });

    expect(result.current.searchString).toBe('javascript');
    expect(mockSetSearchParams).not.toHaveBeenCalledWith(
      expect.objectContaining({ search_query: 'javascript' }),
    );
    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: 'javascript',
    });
  });

  it('should remove search_query from URL if it exists when searching', () => {
    (useSearchParams as jest.Mock).mockReturnValue(withSearchQuery('old-query'));

    const [searchParams, setSearchParams] = withSearchQuery(null);
    const { result } = renderHook(() => useSearch({
      fetchData: mockFetchData,
      isFetching: false,
      searchParams,
      setSearchParams,
    }));

    act(() => {
      result.current.handleSearch('javascript');
    });

    expect(result.current.searchString).toBe('javascript');
    expect(mockSetSearchParams).toHaveBeenCalled();
    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: 'javascript',
    });
  });

  it('initializes search from URL query', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(withSearchQuery('python'));

    const [searchParams, setSearchParams] = withSearchQuery('python');
    const { result } = renderHook(() => useSearch({
      fetchData: mockFetchData,
      isFetching: false,
      searchParams,
      setSearchParams,
    }));

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith({
        pageIndex: DEFAULT_PAGE_INDEX,
        pageSize: DEFAULT_PAGE_SIZE,
        filters: [],
        searchString: 'python',
      });
    });

    expect(result.current.searchString).toBe('python');
  });

  it('does not initialize search from URL while data is fetching', () => {
    (useSearchParams as jest.Mock).mockReturnValue(withSearchQuery('python'));

    const [searchParams, setSearchParams] = withSearchQuery('python');
    renderHook(() => useSearch({
      fetchData: mockFetchData,
      isFetching: true,
      searchParams,
      setSearchParams,
    }));

    expect(mockFetchData).not.toHaveBeenCalled();
  });
});
