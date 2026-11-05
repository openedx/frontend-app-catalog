import type { CourseData } from '@src/generic/course-card/types';
import type { PathwayData } from '@src/generic/pathway-card/types';

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

/**
 * Discriminated result type for mixed course+pathway search responses.
 *
 * `index` and `title` come from the legacy engine-shaped response; the future
 * application response shape omits them, so they are optional and unused.
 */
export type CatalogSearchResult =
  | {
    id: string;
    index?: string;
    type: 'course' | '_doc';
    title?: string;
    data: CourseData;
  }
  | {
    id: string;
    index?: string;
    type: 'pathway';
    title?: string;
    data: PathwayData;
  };

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
