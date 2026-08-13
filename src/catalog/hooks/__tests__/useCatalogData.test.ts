import { renderHook } from '@src/setupTest';
import { mockCourseListSearchResponse } from '@src/__mocks__';
import { useCatalogData } from '../useCatalogData';

const mockCatalogData = mockCourseListSearchResponse;

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
      catalogData: mockCatalogData,
      searchString: '',
    }));

    expect(result.current.previousCatalogData).toEqual(mockCatalogData);
  });

  it('should not save course data when searching', () => {
    const { result } = renderHook(() => useCatalogData({
      catalogData: mockCatalogData,
      searchString: 'javascript',
    }));

    expect(result.current.previousCatalogData).toBeNull();
  });

  it('should keep cached data unchanged while search is active', () => {
    const { result, rerender } = renderHook(
      ({ catalogData, searchString }: {
        catalogData: typeof mockCatalogData | undefined; searchString: string,
      }) => useCatalogData({ catalogData, searchString }),
      {
        initialProps: {
          catalogData: mockCatalogData,
          searchString: '',
        },
      },
    );

    expect(result.current.previousCatalogData).toEqual(mockCatalogData);

    rerender({
      catalogData: { ...mockCatalogData, total: 999 },
      searchString: 'python',
    });

    expect(result.current.previousCatalogData).toEqual(mockCatalogData);

    rerender({
      catalogData: { ...mockCatalogData, total: 888 },
      searchString: 'python',
    });

    expect(result.current.previousCatalogData).toEqual(mockCatalogData);
  });

  it('should allow caching new data when search string becomes empty', () => {
    const { result, rerender } = renderHook(
      ({ catalogData, searchString }: {
        catalogData: typeof mockCatalogData | undefined; searchString: string,
      }) => useCatalogData({ catalogData, searchString }),
      {
        initialProps: {
          catalogData: mockCatalogData,
          searchString: '',
        },
      },
    );

    expect(result.current.previousCatalogData).toEqual(mockCatalogData);

    rerender({
      catalogData: { ...mockCatalogData, total: 10 },
      searchString: 'python',
    });

    expect(result.current.previousCatalogData).toEqual(mockCatalogData);

    rerender({
      catalogData: { ...mockCatalogData, total: 20 },
      searchString: '',
    });

    expect(result.current.previousCatalogData).toEqual({ ...mockCatalogData, total: 20 });
  });

  it('should ignore undefined course data', () => {
    const { result, rerender } = renderHook(
      ({ catalogData, searchString }: {
        catalogData: typeof mockCatalogData | undefined; searchString: string,
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
      catalogData: mockCatalogData,
      searchString: '',
    });

    expect(result.current.previousCatalogData).toEqual(mockCatalogData);
  });

  it('should not save course data during search to keep previous data for empty results fallback', () => {
    const { result, rerender } = renderHook(
      ({ catalogData, searchString }: {
        catalogData: typeof mockCatalogData | undefined; searchString: string,
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
      catalogData: mockCatalogData,
      searchString: 'javascript',
    });

    expect(result.current.previousCatalogData).toBeNull();
  });
});
