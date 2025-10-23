import { renderHook, act } from '@src/setupTest';
import { mockCourseListSearchResponse } from '@src/__mocks__';
import { useCourseData } from '../useCourseData';

const mockOnNoSearchResults = jest.fn();
const mockOnClearLastSearchQuery = jest.fn();

const mockCourseData = {
  ...mockCourseListSearchResponse,
  results: mockCourseListSearchResponse.results.map(result => ({
    ...result,
    title: result.data.content.displayName,
  })),
};

const mockEmptyCourseData = {
  ...mockCourseListSearchResponse,
  results: [],
};

describe('useCourseData', () => {
  beforeEach(() => {
    mockOnNoSearchResults.mockClear();
    mockOnClearLastSearchQuery.mockClear();
  });

  it('should initialize with null previous course data', () => {
    const { result } = renderHook(() => useCourseData({
      courseData: undefined,
      searchString: '',
      isFetching: false,
      onNoSearchResults: mockOnNoSearchResults,
      onClearLastSearchQuery: mockOnClearLastSearchQuery,
    }));

    expect(result.current.previousCourseData).toBeNull();
  });

  it('should save course data when not searching', () => {
    const { result } = renderHook(() => useCourseData({
      courseData: mockCourseData,
      searchString: '',
      isFetching: false,
      onNoSearchResults: mockOnNoSearchResults,
      onClearLastSearchQuery: mockOnClearLastSearchQuery,
    }));

    expect(result.current.previousCourseData).toEqual(mockCourseData);
  });

  it('should not save course data when searching', () => {
    const { result } = renderHook(() => useCourseData({
      courseData: mockCourseData,
      searchString: 'javascript',
      isFetching: false,
      onNoSearchResults: mockOnNoSearchResults,
      onClearLastSearchQuery: mockOnClearLastSearchQuery,
    }));

    expect(result.current.previousCourseData).toBeNull();
  });

  it('should handle search results with data', () => {
    renderHook(() => useCourseData({
      courseData: mockCourseData,
      searchString: 'javascript',
      isFetching: false,
      onNoSearchResults: mockOnNoSearchResults,
      onClearLastSearchQuery: mockOnClearLastSearchQuery,
    }));

    expect(mockOnClearLastSearchQuery).toHaveBeenCalled();
    expect(mockOnNoSearchResults).not.toHaveBeenCalled();
  });

  it('should handle search results with no data', () => {
    renderHook(() => useCourseData({
      courseData: mockEmptyCourseData,
      searchString: 'javascript',
      isFetching: false,
      onNoSearchResults: mockOnNoSearchResults,
      onClearLastSearchQuery: mockOnClearLastSearchQuery,
    }));

    expect(mockOnNoSearchResults).toHaveBeenCalledWith('javascript');
    expect(mockOnClearLastSearchQuery).not.toHaveBeenCalled();
  });

  it('should not process results while fetching', () => {
    renderHook(() => useCourseData(
      {
        courseData: mockEmptyCourseData,
        searchString: 'javascript',
        isFetching: true,
        onNoSearchResults: mockOnNoSearchResults,
        onClearLastSearchQuery: mockOnClearLastSearchQuery,
      },
    ));

    expect(mockOnNoSearchResults).not.toHaveBeenCalled();
    expect(mockOnClearLastSearchQuery).not.toHaveBeenCalled();
  });

  it('should not process when course data is undefined', () => {
    renderHook(() => useCourseData({
      courseData: undefined,
      searchString: 'javascript',
      isFetching: false,
      onNoSearchResults: mockOnNoSearchResults,
      onClearLastSearchQuery: mockOnClearLastSearchQuery,
    }));

    expect(mockOnNoSearchResults).not.toHaveBeenCalled();
    expect(mockOnClearLastSearchQuery).not.toHaveBeenCalled();
  });

  it('should allow manual saving of course data', () => {
    const { result } = renderHook(() => useCourseData({
      courseData: undefined,
      searchString: '',
      isFetching: false,
      onNoSearchResults: mockOnNoSearchResults,
      onClearLastSearchQuery: mockOnClearLastSearchQuery,
    }));

    act(() => {
      result.current.savePreviousCourseData(mockCourseData);
    });

    expect(result.current.previousCourseData).toEqual(mockCourseData);
  });

  it('should not save course data when searching', () => {
    const { result } = renderHook(() => useCourseData({
      courseData: undefined,
      searchString: 'javascript',
      isFetching: false,
      onNoSearchResults: mockOnNoSearchResults,
      onClearLastSearchQuery: mockOnClearLastSearchQuery,
    }));

    act(() => {
      result.current.savePreviousCourseData(mockCourseData);
    });

    expect(result.current.previousCourseData).toBeNull();
  });
});
