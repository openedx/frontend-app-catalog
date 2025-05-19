export interface CourseMediaTypes {
  courseAboutData: {
    name: string;
    media: {
      courseImage: { uri: string };
      courseVideo?: { uri?: string };
    };
  };
}

export type ExtractYouTubeVideoIdTypes = (url: string) => string | null;
