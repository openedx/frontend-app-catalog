import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { render } from '../../setupTest';
import { mockCourseAboutResponse } from '../../__mocks__';
import { useEnrollmentActions, useEnrollmentStatus } from './hooks';
import { CourseIntro } from './CourseIntro';

jest.mock('./hooks', () => ({
  useEnrollmentActions: jest.fn(() => ({
    enrollmentError: null,
    isEnrollmentPending: false,
    handleChangeEnrollment: jest.fn(),
    handleEcommerceCheckout: jest.fn(),
  })),
  useEnrollmentStatus: jest.fn(() => ({
    renderStatusContent: () => <div data-testid="status-content">Status Content</div>,
  })),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

describe('CourseIntro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthenticatedUser as jest.Mock).mockReturnValue(null);
  });

  it('renders course information correctly', () => {
    const { getByText } = render(<CourseIntro courseAboutData={mockCourseAboutResponse} />);

    expect(getByText(mockCourseAboutResponse.name)).toBeInTheDocument();

    expect(getByText(mockCourseAboutResponse.org)).toBeInTheDocument();

    expect(getByText(mockCourseAboutResponse.shortDescription)).toBeInTheDocument();
  });

  it('renders status content from useEnrollmentStatus hook', () => {
    const { getByTestId } = render(<CourseIntro courseAboutData={mockCourseAboutResponse} />);

    expect(getByTestId('status-content')).toBeInTheDocument();
  });

  it('passes correct props to enrollment hooks', () => {
    render(<CourseIntro courseAboutData={mockCourseAboutResponse} />);

    expect(useEnrollmentActions).toHaveBeenCalledWith({
      courseId: mockCourseAboutResponse.id,
      ecommerceCheckoutLink: mockCourseAboutResponse.ecommerceCheckoutLink,
    });

    expect(useEnrollmentStatus).toHaveBeenCalledWith({
      courseAboutData: mockCourseAboutResponse,
      enrollmentError: null,
      authenticatedUser: null,
      isEnrollmentPending: false,
      handleChangeEnrollment: expect.any(Function),
      handleEcommerceCheckout: expect.any(Function),
    });
  });

  it('handles authenticated user correctly', () => {
    const mockUser = { username: 'testuser' };
    (getAuthenticatedUser as jest.Mock).mockReturnValue(mockUser);

    render(<CourseIntro courseAboutData={mockCourseAboutResponse} />);

    expect(useEnrollmentStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        authenticatedUser: mockUser,
      }),
    );
  });

  it('renders with error state', () => {
    (useEnrollmentActions as jest.Mock).mockReturnValue({
      enrollmentError: 'Test error',
      isEnrollmentPending: false,
      handleChangeEnrollment: jest.fn(),
      handleEcommerceCheckout: jest.fn(),
    });

    render(<CourseIntro courseAboutData={mockCourseAboutResponse} />);

    expect(useEnrollmentStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        enrollmentError: 'Test error',
      }),
    );
  });
});
