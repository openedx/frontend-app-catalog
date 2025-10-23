import { useSearchParams } from 'react-router-dom';

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import { renderHook, act } from '@src/setupTest';
import { useSearch } from '../useSearch';

jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
}));

const mockFetchData = jest.fn();
const mockSetSearchParams = jest.fn();

describe('useSearch', () => {
  beforeEach(() => {
    mockFetchData.mockClear();
    mockSetSearchParams.mockClear();
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: jest.fn().mockReturnValue(null) },
      mockSetSearchParams,
    ]);
  });

  it('should initialize with empty search state', () => {
    const { result } = renderHook(() => useSearch(mockFetchData));

    expect(result.current.searchString).toBe('');
    expect(result.current.lastSearchQuery).toBe('');
  });

  it('should handle search', () => {
    const { result } = renderHook(() => useSearch(mockFetchData));

    act(() => {
      result.current.handleSearch('javascript');
    });

    expect(result.current.searchString).toBe('javascript');
    expect(mockSetSearchParams).toHaveBeenCalledWith({ search_query: 'javascript' });
    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: 'javascript',
    });
  });

  it('should handle clear search', () => {
    const { result } = renderHook(() => useSearch(mockFetchData));

    act(() => {
      result.current.handleSearch('javascript');
    });

    act(() => {
      result.current.handleClearSearch();
    });

    expect(result.current.searchString).toBe('');
    expect(result.current.lastSearchQuery).toBe('');
    expect(mockSetSearchParams).toHaveBeenCalledWith({});
    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
    });
  });

  it('should handle no search results', () => {
    const { result } = renderHook(() => useSearch(mockFetchData));

    act(() => {
      result.current.handleNoSearchResults('javascript');
    });

    expect(result.current.lastSearchQuery).toBe('javascript');
    expect(result.current.searchString).toBe('');
    expect(mockSetSearchParams).toHaveBeenCalledWith({});
  });

  it('should clear last search query', () => {
    const { result } = renderHook(() => useSearch(mockFetchData));

    act(() => {
      result.current.handleNoSearchResults('javascript');
    });

    expect(result.current.lastSearchQuery).toBe('javascript');

    act(() => {
      result.current.clearLastSearchQuery();
    });

    expect(result.current.lastSearchQuery).toBe('');
  });

  it('should initialize from URL search query', () => {
    const mockGet = jest.fn().mockReturnValue('react');
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: mockGet },
      mockSetSearchParams,
    ]);

    renderHook(() => useSearch(mockFetchData));

    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
      searchString: 'react',
    });
  });

  it('should fetch default data when no URL search query', () => {
    const mockGet = jest.fn().mockReturnValue(null);
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: mockGet },
      mockSetSearchParams,
    ]);

    renderHook(() => useSearch(mockFetchData));

    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: [],
    });
  });
});
