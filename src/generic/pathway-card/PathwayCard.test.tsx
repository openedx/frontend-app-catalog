import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@openedx/frontend-base';

import { DATE_FORMAT_OPTIONS } from '@src/constants';
import { PathwayCard as ActualPathwayCard } from '.';

import messages from './messages';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  resolveRouteByRole: jest.fn((_role: string, { pathwayId }: { pathwayId: string }) => ({
    url: `/catalog/pathways/${pathwayId}`,
    isInternal: true,
  })),
}));

const formatDateForTest = (dateString: string) => new Intl.DateTimeFormat(
  'en-US',
  DATE_FORMAT_OPTIONS,
).format(new Date(dateString));

const PathwayCard = (props: React.ComponentProps<typeof ActualPathwayCard>) => (
  <IntlProvider locale="en"><MemoryRouter><ActualPathwayCard {...props} /></MemoryRouter></IntlProvider>
);

const props = {
  pathwayId: 'pathway-1',
  name: 'Web Development',
  org: 'Open edX',
  itemCount: 2,
  imageUrl: '/pathway.jpg',
  startDate: '2024-04-01T00:00:00Z',
};

describe('PathwayCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders pathway information and start date', () => {
    render(<PathwayCard {...props} />);

    expect(screen.getByText(props.name)).toBeInTheDocument();
    expect(screen.getByText(props.org)).toBeInTheDocument();
    expect(screen.getByText('2 Courses')).toBeInTheDocument();
    expect(screen.getByText(
      messages.startDate.defaultMessage.replace('{startDate}', formatDateForTest(props.startDate)),
    )).toBeInTheDocument();
  });

  it('renders the category badge with custom colors', () => {
    render(<PathwayCard {...props} categoryLabel="Bootcamp" categoryBackgroundColor="#123456" categoryTextColor="white" />);

    expect(screen.getByText('Bootcamp')).toHaveStyle({
      backgroundColor: '#123456',
      color: 'white',
    });
  });

  it('uses default badge styling when either custom color is invalid or missing', () => {
    const { rerender } = render(
      <PathwayCard {...props} categoryLabel="Bootcamp" categoryBackgroundColor="#123456" />,
    );
    expect(screen.getByText('Bootcamp').style.backgroundColor).toBe('');

    rerender(<PathwayCard {...props} categoryLabel="Bootcamp" categoryBackgroundColor="not-a-color" categoryTextColor="white" />);
    expect(screen.getByText('Bootcamp').style.backgroundColor).toBe('');
  });

  it('does not render a badge when no category label is provided', () => {
    render(<PathwayCard {...props} />);

    expect(screen.queryByText('Bootcamp')).not.toBeInTheDocument();
  });

  it('uses the singular course label and links to the pathway', () => {
    render(<PathwayCard {...props} itemCount={1} />);

    expect(screen.getByText('1 Course')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/catalog/pathways/pathway-1');
  });

  it('renders as a div without a pathway id', () => {
    render(<PathwayCard {...props} pathwayId={undefined} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByTestId('pathway-card').tagName).toBe('DIV');
  });

  it('renders skeletons while loading', () => {
    render(<PathwayCard isLoading />);

    expect(document.querySelectorAll('.react-loading-skeleton')).toHaveLength(4);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByTestId('pathway-card')).toBeInTheDocument();
    expect(screen.queryByText('Bootcamp')).not.toBeInTheDocument();
  });
});
