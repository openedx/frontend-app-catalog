import type { CourseListSearchResponse, DataTableParams } from '@src/data/course-list-search/types';

export interface UseCatalogProps {
  fetchData: (params: DataTableParams) => void;
  courseData: CourseListSearchResponse | undefined;
  isFetching: boolean;
}

export interface UseCourseDataProps {
  courseData: CourseListSearchResponse | undefined;
  searchString: string;
}

export interface UseSearchProps {
  fetchData: (params: DataTableParams) => void;
  courseData: CourseListSearchResponse | undefined;
  isFetching: boolean;
}

export interface UseDebouncedSearchInputProps {
  searchString: string | null | undefined;
  handleSearch: (value: string) => void;
  debounceDelay?: number;
}
