import { render } from '../setupTest';
import HomePage from './HomePage';

describe('<HomeBanner />', () => {
  it('renders title and subtitle', () => {
    const { getByTestId } = render(<HomePage />);

    expect(getByTestId('home-banner')).toBeInTheDocument();
  });
});
