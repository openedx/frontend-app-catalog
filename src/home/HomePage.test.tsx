import { render, cleanup, screen } from '../setupTest';
import { useCourseDiscovery } from '../data/course-discovery/hooks';
import { mockCourseDiscoveryResponse } from '../__mocks__';
import { useHomeSettingsQuery } from './data/hooks';
import { mockHomeSettingsResponse } from './__mocks__';
import HomePage from './HomePage';

jest.mock('./data/hooks', () => ({
  useHomeSettingsQuery: jest.fn(),
}));

jest.mock('../data/course-discovery/hooks', () => ({
  useCourseDiscovery: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

const mockUseHomeSettingsQuery = useHomeSettingsQuery as jest.Mock;
const mockUseCourseDiscovery = useCourseDiscovery as jest.Mock;

describe('<HomePage />', () => {
  it('renders loading state', () => {
    mockUseHomeSettingsQuery.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    });

    render(<HomePage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders Home Page correctly', () => {
    mockUseHomeSettingsQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockHomeSettingsResponse,
    });

    mockUseCourseDiscovery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseDiscoveryResponse,
    });

    render(<HomePage />);
    expect(screen.getByTestId('home-banner')).toBeInTheDocument();
    expect(screen.getByTestId('courses-list')).toBeInTheDocument();
  });
});
