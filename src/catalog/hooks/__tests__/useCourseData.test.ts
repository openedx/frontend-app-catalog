import { renderHook } from '@src/setupTest';
import { mockCourseListSearchResponse } from '@src/__mocks__';
import { useCourseData } from '../useCourseData';

const mockCourseData = {
  ...mockCourseListSearchResponse,
  results: mockCourseListSearchResponse.results.map(result => ({
    ...result,
    title: result.data.content.displayName,
  })),
};

describe('useCourseData', () => {
  it('should initialize with null previous course data', () => {
    const { result } = renderHook(() => useCourseData({
      courseData: undefined,
      searchString: '',
    }));

    expect(result.current.previousCourseData).toBeNull();
  });

  it('should save course data when not searching', () => {
    const { result } = renderHook(() => useCourseData({
      courseData: mockCourseData,
      searchString: '',
    }));

    expect(result.current.previousCourseData).toEqual(mockCourseData);
  });

  it('should not save course data when searching', () => {
    const { result } = renderHook(() => useCourseData({
      courseData: mockCourseData,
      searchString: 'javascript',
    }));

    expect(result.current.previousCourseData).toBeNull();
  });

  it('should keep cached data unchanged while search is active', () => {
    const { result, rerender } = renderHook(
      ({ courseData, searchString }: {
        courseData: typeof mockCourseData | undefined; searchString: string,
      }) => useCourseData({ courseData, searchString }),
      {
        initialProps: {
          courseData: mockCourseData,
          searchString: '',
        },
      },
    );

    expect(result.current.previousCourseData).toEqual(mockCourseData);

    rerender({
      courseData: { ...mockCourseData, total: 999 },
      searchString: 'python',
    });

    expect(result.current.previousCourseData).toEqual(mockCourseData);

    rerender({
      courseData: { ...mockCourseData, total: 888 },
      searchString: 'python',
    });

    expect(result.current.previousCourseData).toEqual(mockCourseData);
  });

  it('should allow caching new data when search string becomes empty', () => {
    const { result, rerender } = renderHook(
      ({ courseData, searchString }: {
        courseData: typeof mockCourseData | undefined; searchString: string,
      }) => useCourseData({ courseData, searchString }),
      {
        initialProps: {
          courseData: mockCourseData,
          searchString: '',
        },
      },
    );

    expect(result.current.previousCourseData).toEqual(mockCourseData);

    rerender({
      courseData: { ...mockCourseData, total: 10 },
      searchString: 'python',
    });

    expect(result.current.previousCourseData).toEqual(mockCourseData);

    rerender({
      courseData: { ...mockCourseData, total: 20 },
      searchString: '',
    });

    expect(result.current.previousCourseData).toEqual({ ...mockCourseData, total: 20 });
  });

  it('should ignore undefined course data', () => {
    const { result, rerender } = renderHook(
      ({ courseData, searchString }: {
        courseData: typeof mockCourseData | undefined; searchString: string,
      }) => useCourseData({ courseData, searchString }),
      {
        initialProps: {
          courseData: undefined,
          searchString: '',
        },
      },
    );

    expect(result.current.previousCourseData).toBeNull();

    rerender({
      courseData: mockCourseData,
      searchString: '',
    });

    expect(result.current.previousCourseData).toEqual(mockCourseData);
  });

  it('should not save course data during search to keep previous data for empty results fallback', () => {
    const { result, rerender } = renderHook(
      ({ courseData, searchString }: {
        courseData: typeof mockCourseData | undefined; searchString: string,
      }) => useCourseData({ courseData, searchString }),
      {
        initialProps: {
          courseData: undefined,
          searchString: 'javascript',
        },
      },
    );

    expect(result.current.previousCourseData).toBeNull();

    rerender({
      courseData: mockCourseData,
      searchString: 'javascript',
    });

    expect(result.current.previousCourseData).toBeNull();
  });
});
