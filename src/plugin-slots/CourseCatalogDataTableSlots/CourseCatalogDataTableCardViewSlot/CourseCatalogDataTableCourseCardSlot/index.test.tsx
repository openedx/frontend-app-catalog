import { getConfig } from '@edx/frontend-platform';

import { render, screen } from '@src/setupTest';
import type { CatalogListSearchMixedResult } from '@src/data/course-list-search/types';
import CourseCatalogDataTableCourseCardSlot from '.';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));

const mockGetConfig = getConfig as jest.Mock;

const course: CatalogListSearchMixedResult = {
  id: 'course-v1:OpenEdx+123+2023',
  index: 'course_info',
  type: '_doc',
  data: {
    id: 'course-v1:OpenEdx+123+2023',
    course: 'course-v1:OpenEdx+123+2023',
    content: {
      displayName: 'Test course 1',
      number: '123',
    },
    imageUrl: '/course.jpg',
    start: '2030-01-01T00:00:00',
    number: '123',
    org: 'OpenEdx',
    advertisedStart: 'Winter 2025',
    modes: ['audit'],
    language: 'en',
    catalogVisibility: 'both',
  },
};

describe('CourseCatalogDataTableCourseCardSlot', () => {
  beforeEach(() => {
    mockGetConfig.mockReturnValue({ ENABLE_PATHWAY_PILOT_UI: true, LMS_BASE_URL: '' });
  });

  it('renders a course card when type is _doc (legacy)', () => {
    render(<CourseCatalogDataTableCourseCardSlot original={course} />);
    expect(screen.getByTestId('course-card')).toBeInTheDocument();
  });

  it('renders a course card when type is course', () => {
    render(<CourseCatalogDataTableCourseCardSlot original={{ ...course, type: 'course' as const }} />);
    expect(screen.getByTestId('course-card')).toBeInTheDocument();
  });

  it('renders skeleton cards in loading state', () => {
    render(<CourseCatalogDataTableCourseCardSlot original={undefined} isLoading />);
    expect(screen.getByTestId('course-card')).toBeInTheDocument();
  });

  it('delegates pathway rows to the pathway card slot (legacy contract)', () => {
    const pathway: CatalogListSearchMixedResult = {
      id: 'pathway-1',
      index: 'course_info',
      type: 'pathway',
      data: {
        content: { displayName: 'Web Development Pathway' },
        org: 'OpenEdx',
        courseCount: 4,
        imageUrl: '/pathway.jpg',
        start: '2024-04-01T00:00:00Z',
        categoryLabel: 'Bootcamp',
      },
    };
    render(<CourseCatalogDataTableCourseCardSlot original={pathway} />);
    expect(screen.getByTestId('pathway-card')).toBeInTheDocument();
    expect(screen.getByText('Web Development Pathway')).toBeInTheDocument();
  });
});
