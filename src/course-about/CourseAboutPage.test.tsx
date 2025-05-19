import { render, waitFor } from '../setupTest';
import { useCourseAboutData } from './data/hooks';
import { mockCourseAboutResponse } from '../__mocks__';
import CourseAboutPage from './CourseAboutPage';

jest.mock('./data/hooks', () => ({
  useCourseAboutData: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(() => null),
}));

jest.mock('./data/hooks', () => ({
  useCourseAboutData: jest.fn(),
  useEnrollment: jest.fn(() => jest.fn()),
}));

const mockCourseAboutData = useCourseAboutData as jest.Mock;

describe('CourseAboutPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should show loading state', () => {
    mockCourseAboutData.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    const { getByRole } = render(<CourseAboutPage />);
    expect(getByRole('status')).toBeInTheDocument();
  });

  it('renders course content when data is loaded', async () => {
    mockCourseAboutData.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockCourseAboutResponse,
    });

    const { getByText } = render(<CourseAboutPage />);

    await waitFor(() => {
      expect(getByText(mockCourseAboutResponse.name)).toBeInTheDocument();
      expect(getByText(mockCourseAboutResponse.org)).toBeInTheDocument();
      expect(getByText(mockCourseAboutResponse.shortDescription)).toBeInTheDocument();
    });
  });
});
