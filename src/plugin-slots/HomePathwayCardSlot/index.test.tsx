import { getConfig } from '@edx/frontend-platform';

import { render, screen } from '@src/setupTest';
import HomePathwayCardSlot from '.';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));

const mockGetConfig = getConfig as jest.Mock;

const pathway = {
  id: 'pathway-1',
  data: {
    content: { displayName: 'Web Development' },
    org: 'Open edX',
    courseCount: 2,
    imageUrl: '/pathway.jpg',
    start: '2024-04-01T00:00:00Z',
    type: 'Bootcamp',
  },
};

describe('HomePathwayCardSlot', () => {
  it('renders nothing when the pathway pilot UI is disabled', () => {
    mockGetConfig.mockReturnValue({ ENABLE_PATHWAY_PILOT_UI: false });

    render(<HomePathwayCardSlot original={pathway} />);

    expect(screen.queryByTestId('pathway-card')).not.toBeInTheDocument();
  });

  it('renders the mapped pathway card when the pathway pilot UI is enabled', () => {
    mockGetConfig.mockReturnValue({ ENABLE_PATHWAY_PILOT_UI: true, LMS_BASE_URL: '' });

    render(<HomePathwayCardSlot original={pathway} />);

    expect(screen.getByTestId('pathway-card')).toBeInTheDocument();
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Open edX')).toBeInTheDocument();
    expect(screen.getByText('2 Courses')).toBeInTheDocument();
    expect(screen.getByText('Bootcamp')).toBeInTheDocument();
  });
});
