import { renderHook, act } from '@src/setupTest';
import type { DataTableFilter } from '@src/data/course-list-search/types';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import { useFilter } from '../useFilter';

const mockFetchData = jest.fn();

describe('useFilter', () => {
  beforeEach(() => {
    mockFetchData.mockClear();
  });

  it('should initialize with default filter state', () => {
    const { result } = renderHook(() => useFilter());

    expect(result.current.filterState).toEqual({
      previousFilters: null,
      isFilterChangeInProgress: false,
    });
  });

  it('should handle first filter application', () => {
    const { result } = renderHook(() => useFilter());
    const newFilters: DataTableFilter[] = [{ id: 'subject', value: 'math' }];

    act(() => {
      const filterChanged = result.current.handleFilterChange(
        newFilters,
        mockFetchData,
        '',
      );
      expect(filterChanged).toBe(true);
    });

    expect(mockFetchData).toHaveBeenCalledWith({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: newFilters,
      searchString: '',
    });

    expect(result.current.filterState.isFilterChangeInProgress).toBe(true);
    expect(result.current.filterState.previousFilters).toEqual(newFilters);
  });

  it('should handle filter changes', () => {
    const { result } = renderHook(() => useFilter());
    const initialFilters: DataTableFilter[] = [{ id: 'subject', value: 'math' }];
    const newFilters: DataTableFilter[] = [{ id: 'subject', value: 'science' }];

    act(() => {
      result.current.handleFilterChange(initialFilters, mockFetchData, '');
    });

    act(() => {
      result.current.resetFilterProgress();
    });

    act(() => {
      const filterChanged = result.current.handleFilterChange(
        newFilters,
        mockFetchData,
        '',
      );
      expect(filterChanged).toBe(true);
    });

    expect(mockFetchData).toHaveBeenLastCalledWith({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      filters: newFilters,
      searchString: '',
    });
  });

  it('should not call fetchData when filter change is in progress', () => {
    const { result } = renderHook(() => useFilter());
    const filters: DataTableFilter[] = [{ id: 'subject', value: 'math' }];

    act(() => {
      result.current.handleFilterChange(filters, mockFetchData, '');
    });

    // Try to apply filters again while in progress
    act(() => {
      const filterChanged = result.current.handleFilterChange(
        filters,
        mockFetchData,
        '',
      );
      expect(filterChanged).toBe(false);
    });

    expect(mockFetchData).toHaveBeenCalledTimes(1);
  });

  it('should reset filter progress', () => {
    const { result } = renderHook(() => useFilter());
    const filters: DataTableFilter[] = [{ id: 'subject', value: 'math' }];

    act(() => {
      result.current.handleFilterChange(filters, mockFetchData, '');
    });

    expect(result.current.filterState.isFilterChangeInProgress).toBe(true);

    act(() => {
      result.current.resetFilterProgress();
    });

    expect(result.current.filterState.isFilterChangeInProgress).toBe(false);
  });

  it('should not trigger filter change for same filters', () => {
    const { result } = renderHook(() => useFilter());
    const filters: DataTableFilter[] = [{ id: 'subject', value: 'math' }];

    act(() => {
      result.current.handleFilterChange(filters, mockFetchData, '');
    });

    act(() => {
      result.current.resetFilterProgress();
    });

    // Apply same filters again
    act(() => {
      const filterChanged = result.current.handleFilterChange(
        filters,
        mockFetchData,
        '',
      );
      expect(filterChanged).toBe(false);
    });

    expect(mockFetchData).toHaveBeenCalledTimes(1);
  });
});
