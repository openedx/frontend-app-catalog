import { renderHook } from '@src/setupTest';
import { mockCourseListSearchResponse } from '@src/__mocks__';
import { useCatalogData } from '../useCatalogData';

const mockCourseData = {
  ...mockCourseListSearchResponse,
  results: mockCourseListSearchResponse.results.map(result => ({
    ...result,
    title: result.data.content.displayName,
  })),
};

describe('useCatalogData', () => {
  it('should initialize with null previous course data', () => {
    const { result } = renderHook(() => useCatalogData({
      catalogData: undefined,
      searchString: '',
    }));

    expect(result.current.previousCatalogData).toBeNull();
  });

  it('should save course data when not searching', () => {
    const { result } = renderHook(() => useCatalogData({
      catalogData: mockCourseData,
      searchString: '',
    }));

    expect(result.current.previousCatalogData).toEqual(mockCourseData);
  });

  it('should not save course data when searching', () => {
    const { result } = renderHook(() => useCatalogData({
      catalogData: mockCourseData,
      searchString: 'javascript',
    }));

    expect(result.current.previousCatalogData).toBeNull();
  });

  it('should keep cached data unchanged while search is active', () => {
    const { result, rerender } = renderHook(
      ({ catalogData, searchString }: {
        catalogData: typeof mockCourseData | undefined; searchString: string,
      }) => useCatalogData({ catalogData, searchString }),
      {
        initialProps: {
          catalogData: mockCourseData,
          searchString: '',
        },
      },
    );

    expect(result.current.previousCatalogData).toEqual(mockCourseData);

    rerender({
      catalogData: { ...mockCourseData, total: 999 },
      searchString: 'python',
    });

    expect(result.current.previousCatalogData).toEqual(mockCourseData);

    rerender({
      catalogData: { ...mockCourseData, total: 888 },
      searchString: 'python',
    });

    expect(result.current.previousCatalogData).toEqual(mockCourseData);
  });

  it('should allow caching new data when search string becomes empty', () => {
    const { result, rerender } = renderHook(
      ({ catalogData, searchString }: {
        catalogData: typeof mockCourseData | undefined; searchString: string,
      }) => useCatalogData({ catalogData, searchString }),
      {
        initialProps: {
          catalogData: mockCourseData,
          searchString: '',
        },
      },
    );

    expect(result.current.previousCatalogData).toEqual(mockCourseData);

    rerender({
      catalogData: { ...mockCourseData, total: 10 },
      searchString: 'python',
    });

    expect(result.current.previousCatalogData).toEqual(mockCourseData);

    rerender({
      catalogData: { ...mockCourseData, total: 20 },
      searchString: '',
    });

    expect(result.current.previousCatalogData).toEqual({ ...mockCourseData, total: 20 });
  });

  it('should ignore undefined course data', () => {
    const { result, rerender } = renderHook(
      ({ catalogData, searchString }: {
        catalogData: typeof mockCourseData | undefined; searchString: string,
      }) => useCatalogData({ catalogData, searchString }),
      {
        initialProps: {
          catalogData: undefined,
          searchString: '',
        },
      },
    );

    expect(result.current.previousCatalogData).toBeNull();

    rerender({
      catalogData: mockCourseData,
      searchString: '',
    });

    expect(result.current.previousCatalogData).toEqual(mockCourseData);
  });

  it('should not save course data during search to keep previous data for empty results fallback', () => {
    const { result, rerender } = renderHook(
      ({ catalogData, searchString }: {
        catalogData: typeof mockCourseData | undefined; searchString: string,
      }) => useCatalogData({ catalogData, searchString }),
      {
        initialProps: {
          catalogData: undefined,
          searchString: 'javascript',
        },
      },
    );

    expect(result.current.previousCatalogData).toBeNull();

    rerender({
      catalogData: mockCourseData,
      searchString: 'javascript',
    });

    expect(result.current.previousCatalogData).toBeNull();
  });
});
