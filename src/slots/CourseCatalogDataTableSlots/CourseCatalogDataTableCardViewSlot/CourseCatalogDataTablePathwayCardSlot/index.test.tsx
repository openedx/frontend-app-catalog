import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getAppConfig, IntlProvider } from '@openedx/frontend-base';

import type { Pathway } from '@src/generic/pathway-card/types';

import CourseCatalogDataTablePathwayCardSlot from '.';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAppConfig: jest.fn(),
}));

const mockGetAppConfig = getAppConfig as jest.Mock;

const pathway: Pathway = {
  id: 'pathway-1',
  index: 'course_info',
  type: 'pathway',
  data: {
    content: { displayName: 'Web Development Pathway' },
    org: 'OpenEdx',
    itemCount: 4,
    imageUrl: '/pathway.jpg',
    start: '2024-04-01T00:00:00Z',
    categoryLabel: 'Bootcamp',
  },
};

const renderComponent = (props: React.ComponentProps<typeof CourseCatalogDataTablePathwayCardSlot>) => render(
  <IntlProvider locale="en"><MemoryRouter><CourseCatalogDataTablePathwayCardSlot {...props} /></MemoryRouter></IntlProvider>,
);

describe('CourseCatalogDataTablePathwayCardSlot', () => {
  beforeEach(() => {
    mockGetAppConfig.mockReturnValue({ ENABLE_PATHWAY_PILOT_UI: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a pathway card', () => {
    renderComponent({ original: pathway });

    expect(screen.getByTestId('pathway-card')).toBeInTheDocument();
    expect(screen.getByText('Web Development Pathway')).toBeInTheDocument();
    expect(screen.getByText('OpenEdx')).toBeInTheDocument();
    expect(screen.getByText('Bootcamp')).toBeInTheDocument();
  });
});
