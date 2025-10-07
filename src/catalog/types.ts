import { CourseListSearchResponse } from '@src/data/course-list-search/types';

export interface TransformedCourseItem {
  id: string;
  famous_for: string;
  language: string;
  modes: string[];
  org: string;
  data: CourseListSearchResponse['results'][0]['data'];
  index?: string;
  type?: string;
}
