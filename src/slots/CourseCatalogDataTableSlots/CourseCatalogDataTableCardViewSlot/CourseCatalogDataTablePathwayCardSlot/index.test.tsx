import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@openedx/frontend-base';

import type { Pathway } from '@src/generic/pathway-card/types';

import CourseCatalogDataTablePathwayCardSlot from '.';

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
