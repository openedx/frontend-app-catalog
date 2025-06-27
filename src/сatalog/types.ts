import { CourseDiscoveryResponse } from './data/types';

export interface TransformedCourseItem {
  id: string;
  famous_for: string;
  language: string;
  modes: string[];
  org: string;
  data: CourseDiscoveryResponse['results'][0]['data'];
  index?: string;
  type?: string;
}
