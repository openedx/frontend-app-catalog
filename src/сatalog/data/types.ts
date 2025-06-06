export interface CourseDiscoveryResponse {
  count: number;
  results: {
    id: string;
    title: string;
    data: {
      id: string;
      course: string;
      start: string;
      imageUrl: string;
      org: string;
      content: {
        displayName: string;
        overview?: string;
        number?: string;
      };
      number: string;
      modes: string[];
      language: string;
      catalogVisibility: string;
    };
  }[];
}
