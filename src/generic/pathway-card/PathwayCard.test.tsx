import { getConfig } from '@edx/frontend-platform';
import { render, screen, formatDateForTest } from '@src/setupTest';

import { PathwayCard } from '.';
import messages from './messages';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));

const mockGetConfig = getConfig as jest.Mock;

describe('PathwayCard', () => {
  beforeEach(() => {
    mockGetConfig.mockReturnValue({ ENABLE_PATHWAY_PILOT_UI: true });
  });

  const props = {
    pathwayId: 'pathway-1',
    name: 'Web Development',
    org: 'Open edX',
    courseCount: 2,
    imageUrl: '/pathway.jpg',
    startDate: '2024-04-01T00:00:00Z',
  };

  it('renders pathway information and start date', () => {
    render(<PathwayCard {...props} />);

    expect(screen.getByText(props.name)).toBeInTheDocument();
    expect(screen.getByText(props.org)).toBeInTheDocument();
    expect(screen.getByText('2 Courses')).toBeInTheDocument();
    expect(screen.getByText(
      messages.startDate.defaultMessage.replace('{startDate}', formatDateForTest(props.startDate)),
    )).toBeInTheDocument();
  });

  it('renders the pathway type badge with custom colors', () => {
    render(<PathwayCard {...props} type="Bootcamp" typeBackgroundColor="#123456" typeTextColor="white" />);

    expect(screen.getByText('Bootcamp')).toHaveStyle({
      backgroundColor: '#123456',
      color: 'white',
    });
  });

  it('does not render the badge when disabled', () => {
    mockGetConfig.mockReturnValue({ ENABLE_PATHWAY_PILOT_UI: false });

    render(<PathwayCard {...props} type="Bootcamp" />);

    expect(screen.queryByText('Bootcamp')).not.toBeInTheDocument();
  });

  it('uses default badge styling when either custom color is invalid or missing', () => {
    const { rerender } = render(
      <PathwayCard {...props} type="Bootcamp" typeBackgroundColor="#123456" />,
    );
    expect(screen.getByText('Bootcamp').style.backgroundColor).toBe('');

    rerender(<PathwayCard {...props} type="Bootcamp" typeBackgroundColor="not-a-color" typeTextColor="white" />);
    expect(screen.getByText('Bootcamp').style.backgroundColor).toBe('');
  });

  it('does not render a pathway type badge when type is missing', () => {
    render(<PathwayCard {...props} />);

    expect(screen.queryByText('Bootcamp')).not.toBeInTheDocument();
  });

  it('uses the singular course label and links to the pathway', () => {
    render(<PathwayCard {...props} courseCount={1} />);

    expect(screen.getByText('1 Course')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/pathways/pathway-1');
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
    expect(screen.queryByTestId('pathway-card')).toBeInTheDocument();
    expect(screen.queryByText('Bootcamp')).not.toBeInTheDocument();
  });
});
