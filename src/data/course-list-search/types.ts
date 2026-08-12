import type { CourseData } from '@src/generic/course-card/types';

export interface CourseListSearchResponse<T = CourseData> {
  took: number;
  total: number;
  results: {
    id: string;
    index: string;
    type: string;
    title: string;
    data: T;
  }[];
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

export interface CourseListSearchHook {
  data: CourseListSearchResponse | undefined;
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
