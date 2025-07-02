import { useCourseDiscovery } from '../data/course-discovery/hooks';
import { mockCourseDiscoveryResponse } from '../__mocks__';
import { render, cleanup } from '../setupTest';
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

    const { getByRole } = render(<HomePage />);
    expect(getByRole('status')).toBeInTheDocument();
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

    const { getByTestId } = render(<HomePage />);
    expect(getByTestId('home-banner')).toBeInTheDocument();
    expect(getByTestId('courses-list')).toBeInTheDocument();
  });
});
