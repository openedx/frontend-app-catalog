import { render, screen, formatDateForTest } from '@src/setupTest';

import { PathwayCard } from '.';
import messages from './messages';

describe('PathwayCard', () => {
  const props = {
    pathwayId: 'pathway-1',
    pathwayName: 'Web Development',
    pathwayOrg: 'Open edX',
    pathwayCourseCount: 2,
    pathwayImageUrl: '/pathway.jpg',
    pathwayStartDate: '2024-04-01T00:00:00Z',
  };

  it('renders pathway information and start date', () => {
    render(<PathwayCard {...props} />);

    expect(screen.getByText(props.pathwayName)).toBeInTheDocument();
    expect(screen.getByText(props.pathwayOrg)).toBeInTheDocument();
    expect(screen.getByText('2 Courses')).toBeInTheDocument();
    expect(screen.getByText(
      messages.startDate.defaultMessage.replace('{startDate}', formatDateForTest(props.pathwayStartDate)),
    )).toBeInTheDocument();
  });

  it('uses the singular course label and links to the pathway', () => {
    render(<PathwayCard {...props} pathwayCourseCount={1} />);

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
  });
});
