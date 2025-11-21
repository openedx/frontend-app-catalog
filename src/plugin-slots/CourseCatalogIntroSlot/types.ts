import type { CourseListSearchResponse } from '@src/data/course-list-search/types';

export interface CourseCatalogIntroSlotProps {
  searchString: string;
  courseData: CourseListSearchResponse | undefined;
}
