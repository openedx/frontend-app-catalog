import { getConfig } from '@edx/frontend-platform';

import { render, screen } from '@src/setupTest';
import type { CatalogListSearchMixedResult } from '@src/data/course-list-search/types';
import { CourseCatalogDataTableCardSlot } from '.';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));

const mockGetConfig = getConfig as jest.Mock;

const pathway: CatalogListSearchMixedResult = {
  id: 'pathway-1',
  type: 'pathway',
  data: {
    content: { displayName: 'Web Development Pathway' },
    org: 'OpenEdx',
    courseCount: 4,
    categoryLabel: 'Bootcamp',
  },
};

const course: CatalogListSearchMixedResult = {
  id: 'course-v1:OpenEdx+123+2023',
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
    modes: ['audit'],
    language: 'en',
    catalogVisibility: 'both',
  },
};

describe('CourseCatalogDataTableCardSlot', () => {
  beforeEach(() => {
    mockGetConfig.mockReturnValue({ ENABLE_PATHWAY_PILOT_UI: true, LMS_BASE_URL: '' });
  });

  it('renders the pathway card slot for pathway results', () => {
    render(<CourseCatalogDataTableCardSlot original={pathway} />);
    expect(screen.getByTestId('pathway-card')).toBeInTheDocument();
  });

  it('renders the course card slot for course results', () => {
    render(<CourseCatalogDataTableCardSlot original={course} />);
    expect(screen.getByTestId('course-card')).toBeInTheDocument();
  });

  it('renders the course card slot for loading rows without a result', () => {
    render(<CourseCatalogDataTableCardSlot isLoading />);
    expect(screen.getByTestId('course-card')).toBeInTheDocument();
  });
});
