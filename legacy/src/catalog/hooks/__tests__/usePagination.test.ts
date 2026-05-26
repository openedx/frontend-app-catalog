import { renderHook, act } from '@src/setupTest';
import { DEFAULT_PAGE_INDEX } from '@src/data/course-list-search/constants';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  it('should initialize with default page index', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.pageIndex).toBe(DEFAULT_PAGE_INDEX);
  });

  it('should handle page change', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageChange(2);
    });

    expect(result.current.pageIndex).toBe(2);
  });

  it('should reset pagination to first page', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageChange(3);
    });

    expect(result.current.pageIndex).toBe(3);

    act(() => {
      result.current.resetPagination();
    });

    expect(result.current.pageIndex).toBe(DEFAULT_PAGE_INDEX);
  });

  it('should handle multiple page changes', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageChange(1);
    });
    expect(result.current.pageIndex).toBe(1);

    act(() => {
      result.current.handlePageChange(5);
    });
    expect(result.current.pageIndex).toBe(5);
  });
});
