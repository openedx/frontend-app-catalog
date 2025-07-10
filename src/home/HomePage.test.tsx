import { render, cleanup, screen } from '../setupTest';
import { useFrontendParams } from '../data/frontend-params';
import { mockFrontendParamsResponse } from '../__mocks__';
import HomePage from './HomePage';

jest.mock('../data/frontend-params', () => ({
  useFrontendParams: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

const mockUseFrontendParams = useFrontendParams as jest.Mock;

describe('<HomePage />', () => {
  it('renders loading state', () => {
    mockUseFrontendParams.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    });

    render(<HomePage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders HomeBanner with data props', () => {
    mockUseFrontendParams.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockFrontendParamsResponse,
    });

    render(<HomePage />);
    expect(screen.getByTestId('home-banner')).toBeInTheDocument();
  });
});
