import type { Course } from '@src/generic/course-card/types';
import type { Pathway } from '@src/generic/pathway-card/types';

/** Shared envelope for search responses (everything except the result list). */
export interface SearchResponseBase {
  took: number;
  total: number;
  aggs: Record<string, {
    terms: Record<string, number>;
    /** Optional slug -> display label map (category facet enrichment). */
    labels?: Record<string, string>;
    total: number;
    other: number;
  }>;
  maxScore: number;
}

/** A catalog search result is either a course or a pathway. */
export type CatalogSearchResult = Course | Pathway;

/** Search response that can mix course and pathway results. */
export interface CatalogSearchResponse extends SearchResponseBase {
  results: CatalogSearchResult[];
}

export type Aggregations = Record<string, {
  terms: Record<string, number>;
  labels?: Record<string, string>;
}>;

export interface CatalogSearchParams {
  pageSize?: number;
  pageIndex?: number;
  filters?: Record<string, string[]>;
  enableCourseSortingByStartDate?: boolean;
  searchString?: string;
}

export interface DataTableParams {
  pageSize?: number;
  pageIndex?: number;
  filters?: {
    id: string;
    value: string | string[];
  }[];
  searchString?: string;
}

export interface CatalogSearchHook {
  data: CatalogSearchResponse | undefined;
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

/** @deprecated Use `CatalogSearchResponse`. */
export type CourseListSearchResponse = CatalogSearchResponse;

/** @deprecated Use `CatalogSearchParams`. */
export type CourseListSearchParams = CatalogSearchParams;
