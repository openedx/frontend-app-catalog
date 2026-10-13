import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@openedx/frontend-base';

import type { CatalogListSearchMixedResult } from '@src/data/catalog-list-search/types';

import { CourseCatalogDataTableCardSlot } from '.';

const pathway: CatalogListSearchMixedResult = {
  id: 'pathway-1',
  type: 'pathway',
  data: {
    content: { displayName: 'Web Development Pathway' },
    org: 'OpenEdx',
    itemCount: 4,
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

const renderComponent = (props: React.ComponentProps<typeof CourseCatalogDataTableCardSlot>) => render(
  <IntlProvider locale="en"><MemoryRouter><CourseCatalogDataTableCardSlot {...props} /></MemoryRouter></IntlProvider>,
);

describe('CourseCatalogDataTableCardSlot', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the pathway card slot for pathway results', () => {
    renderComponent({ original: pathway });

    expect(screen.getByTestId('pathway-card')).toBeInTheDocument();
  });

  it('renders the course card slot for course results', () => {
    renderComponent({ original: course });

    expect(screen.getByTestId('course-card')).toBeInTheDocument();
  });

  it('renders the course card slot for loading rows without a result', () => {
    renderComponent({ isLoading: true });

    expect(screen.getByTestId('course-card')).toBeInTheDocument();
  });
});
