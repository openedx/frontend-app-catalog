import type { Course } from '@src/generic/course-card/types';

export const mockCourseResponse: Course = {
  id: 'course-v1:edX+DemoX+Demo_Course',
  data: {
    id: 'course-v1:edX+DemoX+Demo_Course',
    course: 'Demo Course',
    start: '2024-04-01T00:00:00Z',
    imageUrl: '/asset-v1:edX+DemoX+Demo_Course+type@asset+block@course_image.jpg',
    org: 'edX',
    orgImageUrl: '/asset-v1:edX+DemoX+Demo_Course+type@asset+block@org_image.jpg',
    advertisedStart: 'Winter 2025',
    content: {
      displayName: 'Demonstration Course',
      overview: 'Course overview',
      number: 'DemoX',
    },
    number: 'DemoX',
    modes: ['audit', 'verified'],
    language: 'en',
    catalogVisibility: 'both',
  },
};
