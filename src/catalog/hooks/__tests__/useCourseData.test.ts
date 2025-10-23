import { renderHook, act } from '@src/setupTest';
import type { CourseListSearchResponse } from '@src/data/course-list-search/types';
import { useCourseData } from '../useCourseData';

const mockOnNoSearchResults = jest.fn();
const mockOnClearLastSearchQuery = jest.fn();

const mockCourseData: CourseListSearchResponse = {
  results: [
    {
      id: '1',
      index: '1',
      type: 'course',
      title: 'Course 1',
      data: {
        id: '1',
        course: 'Course 1',
        start: '2021-01-01',
        imageUrl: 'https://example.com/image.jpg',
        org: 'Org 1',
        orgImageUrl: 'https://example.com/org-image.jpg',
        content: { displayName: 'Course 1', overview: 'Overview 1', number: '1' },
        number: '1',
        modes: ['mode1', 'mode2'],
        language: 'en',
        catalogVisibility: 'public',
      },
    },
    {
      id: '2',
      index: '2',
      type: 'course',
      title: 'Course 2',
      data: {
        id: '2',
        course: 'Course 2',
        start: '2021-01-02',
        imageUrl: 'https://example.com/image.jpg',
        org: 'Org 2',
        orgImageUrl: 'https://example.com/org-image.jpg',
        content: { displayName: 'Course 2', overview: 'Overview 2', number: '2' },
        number: '2',
        modes: ['mode3', 'mode4'],
        language: 'es',
        catalogVisibility: 'public',
      },
    },
  ],
  total: 2,
  aggs: {},
  took: 0,
  maxScore: 0,
};

const mockEmptyCourseData: CourseListSearchResponse = {
  results: [],
  total: 0,
  aggs: {},
  took: 0,
  maxScore: 0,
};

describe('useCourseData', () => {
  beforeEach(() => {
    mockOnNoSearchResults.mockClear();
    mockOnClearLastSearchQuery.mockClear();
  });

  it('should initialize with null previous course data', () => {
    const { result } = renderHook(() => useCourseData(
      undefined,
      '',
      false,
      mockOnNoSearchResults,
      mockOnClearLastSearchQuery,
    ));

    expect(result.current.previousCourseData).toBeNull();
  });

  it('should save course data when not searching', () => {
    const { result } = renderHook(() => useCourseData(
      mockCourseData,
      '',
      false,
      mockOnNoSearchResults,
      mockOnClearLastSearchQuery,
    ));

    expect(result.current.previousCourseData).toEqual(mockCourseData);
  });

  it('should not save course data when searching', () => {
    const { result } = renderHook(() => useCourseData(
      mockCourseData,
      'javascript',
      false,
      mockOnNoSearchResults,
      mockOnClearLastSearchQuery,
    ));

    expect(result.current.previousCourseData).toBeNull();
  });

  it('should handle search results with data', () => {
    renderHook(() => useCourseData(
      mockCourseData,
      'javascript',
      false,
      mockOnNoSearchResults,
      mockOnClearLastSearchQuery,
    ));

    expect(mockOnClearLastSearchQuery).toHaveBeenCalled();
    expect(mockOnNoSearchResults).not.toHaveBeenCalled();
  });

  it('should handle search results with no data', () => {
    renderHook(() => useCourseData(
      mockEmptyCourseData,
      'javascript',
      false,
      mockOnNoSearchResults,
      mockOnClearLastSearchQuery,
    ));

    expect(mockOnNoSearchResults).toHaveBeenCalledWith('javascript');
    expect(mockOnClearLastSearchQuery).not.toHaveBeenCalled();
  });

  it('should not process results while fetching', () => {
    renderHook(() => useCourseData(
      mockEmptyCourseData,
      'javascript',
      true,
      mockOnNoSearchResults,
      mockOnClearLastSearchQuery,
    ));

    expect(mockOnNoSearchResults).not.toHaveBeenCalled();
    expect(mockOnClearLastSearchQuery).not.toHaveBeenCalled();
  });

  it('should not process when course data is undefined', () => {
    renderHook(() => useCourseData(
      undefined,
      'javascript',
      false,
      mockOnNoSearchResults,
      mockOnClearLastSearchQuery,
    ));

    expect(mockOnNoSearchResults).not.toHaveBeenCalled();
    expect(mockOnClearLastSearchQuery).not.toHaveBeenCalled();
  });

  it('should allow manual saving of course data', () => {
    const { result } = renderHook(() => useCourseData(
      undefined,
      '',
      false,
      mockOnNoSearchResults,
      mockOnClearLastSearchQuery,
    ));

    act(() => {
      result.current.savePreviousCourseData(mockCourseData);
    });

    expect(result.current.previousCourseData).toEqual(mockCourseData);
  });

  it('should not save course data when searching', () => {
    const { result } = renderHook(() => useCourseData(
      undefined,
      'javascript',
      false,
      mockOnNoSearchResults,
      mockOnClearLastSearchQuery,
    ));

    act(() => {
      result.current.savePreviousCourseData(mockCourseData);
    });

    expect(result.current.previousCourseData).toBeNull();
  });
});
