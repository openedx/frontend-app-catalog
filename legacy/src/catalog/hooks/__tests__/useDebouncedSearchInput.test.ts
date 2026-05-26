import { renderHook, act } from '@src/setupTest';
import { useDebouncedSearchInput } from '../useDebouncedSearchInput';

jest.useFakeTimers();

describe('useDebouncedSearchInput', () => {
  const mockHandleSearch = jest.fn();

  it('should initialize with searchString value', () => {
    const { result } = renderHook(() => useDebouncedSearchInput({
      searchString: 'initial query',
      handleSearch: mockHandleSearch,
    }));

    expect(result.current.setSearchInput).toBeDefined();
  });

  it('should debounce search calls', () => {
    const { result } = renderHook(() => useDebouncedSearchInput({
      searchString: '',
      handleSearch: mockHandleSearch,
      debounceDelay: 300,
    }));

    act(() => {
      result.current.setSearchInput('a');
    });

    act(() => {
      result.current.setSearchInput('ab');
    });

    act(() => {
      result.current.setSearchInput('abc');
    });

    expect(mockHandleSearch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockHandleSearch).toHaveBeenCalledTimes(1);
    expect(mockHandleSearch).toHaveBeenCalledWith('abc');
  });

  it('should handle null searchString', () => {
    const { result } = renderHook(() => useDebouncedSearchInput({
      searchString: null,
      handleSearch: mockHandleSearch,
    }));

    act(() => {
      result.current.setSearchInput('test');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockHandleSearch).toHaveBeenCalledWith('test');
  });
});
