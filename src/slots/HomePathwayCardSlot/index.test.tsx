import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@openedx/frontend-base';

import HomePathwayCardSlot from '.';

const pathway = {
  id: 'pathway-1',
  data: {
    content: { displayName: 'Web Development' },
    org: 'Open edX',
    itemCount: 2,
    imageUrl: '/pathway.jpg',
    start: '2024-04-01T00:00:00Z',
    categoryLabel: 'Bootcamp',
  },
};

const renderComponent = (
  props: React.ComponentProps<typeof HomePathwayCardSlot>,
) =>
  render(
    <IntlProvider locale="en">
      <MemoryRouter>
        <HomePathwayCardSlot {...props} />
      </MemoryRouter>
    </IntlProvider>,
  );

describe('HomePathwayCardSlot', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the mapped pathway card', () => {
    renderComponent({ original: pathway });

    expect(screen.getByTestId('pathway-card')).toBeInTheDocument();
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Open edX')).toBeInTheDocument();
    expect(screen.getByText('2 Courses')).toBeInTheDocument();
    expect(screen.getByText('Bootcamp')).toBeInTheDocument();
  });

  it('maps category fields', () => {
    renderComponent({
      original: {
        ...pathway,
        data: {
          ...pathway.data,
          category: 'bootcamp',
          categoryBackgroundColor: '#654321',
          categoryTextColor: '#eeeeee',
        },
      },
    });

    expect(screen.getByText('Bootcamp')).toHaveStyle({
      backgroundColor: '#654321',
      color: '#eeeeee',
    });
  });
});
