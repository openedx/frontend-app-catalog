import type { CourseData } from '@src/generic/course-card/types';
import type { PathwayData } from '@src/generic/pathway-card/types';

/** Shared envelope for search responses (everything except the result list). */
export interface SearchResponseBase {
  took: number;
  total: number;
  aggs: {
    [key: string]: {
      terms: {
        [key: string]: number;
      };
      total: number;
      other: number;
    };
  };
  maxScore: number;
}

export interface CourseListSearchResponse<T = CourseData> extends SearchResponseBase {
  results: CourseListSearchResult<T>[];
}

/** Generic result type for course-only search responses. */
export type CourseListSearchResult<T = CourseData> = {
  id: string;
  index: string;
  type: string;
  title: string;
  data: T;
};

export interface Aggregations {
  [key: string]: {
    terms: {
      [key: string]: number;
    };
  };
}

export interface CourseListSearchParams {
  pageSize?: number;
  pageIndex?: number;
  filters?: Record<string, string[]>;
  enableCourseSortingByStartDate?: boolean;
  searchString?: string;
}

export interface DataTableParams {
  pageSize?: number;
  pageIndex?: number;
  filters?: Array<{
    id: string;
    value: string | string[];
  }>;
  searchString?: string;
}

/** Discriminated result type for mixed course+pathway search responses. */
export type CatalogListSearchMixedResult =
  | {
      id: string;
      index: string;
      type: 'course' | '_doc';
      title: string;
      data: CourseData;
    }
  | {
      id: string;
      index: string;
      type: 'pathway';
      title: string;
      data: PathwayData;
    };

/** Search response that can mix course and pathway results. */
export interface CatalogListSearchMixedResponse extends SearchResponseBase {
  results: CatalogListSearchMixedResult[];
}

export interface CatalogListSearchHook {
  data: CatalogListSearchMixedResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  fetchData: (params: DataTableParams) => void;
}

export interface DataTableFilter {
  id: string;
  value: string | string[];
}
