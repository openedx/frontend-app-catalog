import type { CourseListSearchResponse, DataTableParams } from '@src/data/course-list-search/types';

export interface UseCatalogProps {
  fetchData: (params: DataTableParams) => void;
  courseData: CourseListSearchResponse | undefined;
  isFetching: boolean;
}

export interface UseCourseDataProps {
  courseData: CourseListSearchResponse | undefined;
  searchString: string;
  isFetching: boolean;
  onNoSearchResults: (searchQuery: string) => void;
  onClearLastSearchQuery: () => void;
}
