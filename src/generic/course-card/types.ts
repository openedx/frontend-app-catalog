export interface CourseContent {
  displayName: string;
  overview?: string;
  number?: string;
}

export interface CourseData {
  id: string;
  course: string;
  start: string;
  imageUrl: string;
  org: string;
  orgImageUrl?: string;
  advertisedStart?: string;
  content: CourseContent;
  number: string;
  modes: string[];
  language: string;
  catalogVisibility: string;
}

export interface Course {
  id: string;
  index?: string;
  type?: string;
  data: CourseData;
}

export interface CourseCardProps {
  course?: Course;
  isLoading?: boolean;
}
