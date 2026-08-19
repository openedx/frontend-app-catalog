import { getConfig } from '@edx/frontend-platform';

import { render, screen } from '@src/setupTest';
import type { Pathway } from '@src/generic/pathway-card/types';
import CourseCatalogDataTablePathwayCardSlot from '.';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));

const mockGetConfig = getConfig as jest.Mock;

const pathway: Pathway = {
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

describe('CourseCatalogDataTablePathwayCardSlot', () => {
  beforeEach(() => {
    mockGetConfig.mockReturnValue({ ENABLE_PATHWAY_PILOT_UI: true, LMS_BASE_URL: '' });
  });

  it('renders a pathway card', () => {
    render(<CourseCatalogDataTablePathwayCardSlot original={pathway} />);
    expect(screen.getByTestId('pathway-card')).toBeInTheDocument();
    expect(screen.getByText('Web Development Pathway')).toBeInTheDocument();
    expect(screen.getByText('OpenEdx')).toBeInTheDocument();
    expect(screen.getByText('Bootcamp')).toBeInTheDocument();
  });
});
