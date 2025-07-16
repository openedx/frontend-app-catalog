export interface CourseDiscoveryResponse {
  took: number;
  total: number;
  results: {
    id: string;
    index: string;
    type: string;
    data: {
      id: string;
      course: string;
      content: {
        displayName: string;
        overview?: string;
        number?: string;
      };
      imageUrl: string;
      start: string;
      number: string;
      org: string;
      modes: string[];
      catalogVisibility: string;
      language: string;
    };
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

export interface CourseDiscoveryParams {
  pageSize?: number;
  pageIndex?: number;
  filters?: Record<string, string[]>;
}

export interface DataTableParams {
  pageSize?: number;
  pageIndex?: number;
  filters?: Array<{
    id: string;
    value: string | string[];
  }>;
}

export interface CourseDiscoveryHook {
  data: CourseDiscoveryResponse | undefined;
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
