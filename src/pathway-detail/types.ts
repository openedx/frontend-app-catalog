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

export interface PathwayInstructor {
  id: string;
  name: string;
  role: string;
}

export interface PathwayFaq {
  id: string;
  question: string;
  answer: string;
}

export interface PathwayTestimonial {
  id: string;
  quote: string;
  attribution: string;
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
  instructors: PathwayInstructor[];
  faqs: PathwayFaq[];
  testimonials: PathwayTestimonial[];
}
