import { useSearchParams } from 'react-router-dom';

import type { CourseListSearchResponse, DataTableParams } from '@src/data/course-list-search/types';

export interface UseCatalogProps {
  fetchData: (params: DataTableParams) => void;
  courseData: CourseListSearchResponse | undefined;
  isFetching: boolean;
  searchParams: ReturnType<typeof useSearchParams>[0];
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}

export interface UseCourseDataProps {
  courseData: CourseListSearchResponse | undefined;
  searchString: string;
}

export interface UseSearchProps {
  fetchData: (params: DataTableParams) => void;
  isFetching: boolean;
  searchParams: ReturnType<typeof useSearchParams>[0];
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}

export interface UseDebouncedSearchInputProps {
  searchString: string | null | undefined;
  handleSearch: (value: string) => void;
  debounceDelay?: number;
}
