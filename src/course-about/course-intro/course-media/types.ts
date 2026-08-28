import type { CourseMediaPartial } from '../../types';

export interface CourseMediaTypes {
  courseAboutData: {
    name: string;
    media: CourseMediaPartial;
  };
}

export type ExtractYouTubeVideoIdTypes = (url: string) => string | null;
