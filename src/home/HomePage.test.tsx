import { render, cleanup } from '../setupTest';
import { useHomeSettingsQuery } from './data/hooks';
import { mockHomeSettingsResponse } from './__mocks__';
import HomePage from './HomePage';

jest.mock('./data/hooks', () => ({
  useHomeSettingsQuery: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

const mockUseHomeSettingsQuery = useHomeSettingsQuery as jest.Mock;

describe('<HomePage />', () => {
  it('renders loading state', () => {
    mockUseHomeSettingsQuery.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    });

    const { getByRole } = render(<HomePage />);
    expect(getByRole('status')).toBeInTheDocument();
  });

  it('renders HomeBanner with data props', () => {
    mockUseHomeSettingsQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockHomeSettingsResponse,
    });

    const { getByTestId } = render(<HomePage />);
    expect(getByTestId('home-banner')).toBeInTheDocument();
  });
});
