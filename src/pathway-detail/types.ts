import type { CourseAboutData } from '@src/course-about/types';

export interface PathwayFact {
  label: string;
  value: string;
}

export interface PathwayCourse {
  id: string;
  title: string;
  summary: string;
  courseAboutData: CourseAboutData;
}

export interface PathwayCredential {
  id: string;
  title: string;
  courseTitle: string;
}

export interface PathwayDetailData {
  id: string;
  name: string;
  organization: string;
  description: string;
  about: string[];
  imageUrl?: string;
  isEnrolled: boolean;
  facts: PathwayFact[];
  courses: PathwayCourse[];
  credentials: PathwayCredential[];
}
