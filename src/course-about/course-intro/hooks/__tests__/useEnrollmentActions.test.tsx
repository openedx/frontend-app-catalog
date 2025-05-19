import { logError } from '@edx/frontend-platform/logging';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { renderHook, act } from '../../../../setupTest';
import { useEnrollment } from '../../../data/hooks';
import { useEnrollmentActions } from '../useEnrollmentActions';
import { UseEnrollmentActionsTypes } from '../types';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../../../data/hooks', () => ({
  useEnrollment: jest.fn(),
}));

const renderHookWithWrapper = (props: UseEnrollmentActionsTypes) => renderHook(
  () => useEnrollmentActions(props),
  {
    wrapper: ({ children }) => (
      <IntlProvider locale="en" messages={{}}>
        {children}
      </IntlProvider>
    ),
  },
);

describe('useEnrollmentActions', () => {
  const mockCourseId = 'course-123';
  const mockEcommerceCheckoutLink = 'http://example.com/checkout';
  const mockEnrollAndRedirect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useEnrollment as jest.Mock).mockReturnValue(mockEnrollAndRedirect);
  });

  it('should initialize with default state', () => {
    const { result } = renderHookWithWrapper({
      courseId: mockCourseId,
      ecommerceCheckoutLink: mockEcommerceCheckoutLink,
    });

    expect(result.current.enrollmentError).toBeNull();
    expect(result.current.isEnrollmentPending).toBe(false);
  });

  it('should handle successful enrollment', async () => {
    mockEnrollAndRedirect.mockResolvedValueOnce(undefined);
    const { result } = renderHookWithWrapper({
      courseId: mockCourseId,
      ecommerceCheckoutLink: mockEcommerceCheckoutLink,
    });

    await act(async () => {
      await result.current.handleChangeEnrollment();
    });

    expect(mockEnrollAndRedirect).toHaveBeenCalledWith(
      mockCourseId,
      'http://localhost:18000/dashboard',
    );
  });

  it('should handle enrollment error', async () => {
    const mockError = new Error('Enrollment failed');
    mockEnrollAndRedirect.mockRejectedValueOnce(mockError);
    const { result } = renderHookWithWrapper({
      courseId: mockCourseId,
      ecommerceCheckoutLink: mockEcommerceCheckoutLink,
    });

    await act(async () => {
      await result.current.handleChangeEnrollment();
    });

    expect(logError).toHaveBeenCalledWith('Failed to enroll in course', mockError);
    expect(result.current.isEnrollmentPending).toBe(false);
  });

  it('should handle ecommerce checkout with valid link', () => {
    const { result } = renderHookWithWrapper({
      courseId: mockCourseId,
      ecommerceCheckoutLink: mockEcommerceCheckoutLink,
    });

    const mockAssign = jest.fn();
    Object.defineProperty(window, 'location', {
      value: {
        assign: mockAssign,
        href: '',
      },
      configurable: true,
    });

    result.current.handleEcommerceCheckout();

    expect(mockAssign).toHaveBeenCalledWith(mockEcommerceCheckoutLink);
    expect(logError).not.toHaveBeenCalled();
  });

  it('should handle ecommerce checkout with missing link', () => {
    const { result } = renderHookWithWrapper({
      courseId: mockCourseId,
      ecommerceCheckoutLink: undefined,
    });

    result.current.handleEcommerceCheckout();

    expect(logError).toHaveBeenCalledWith('Ecommerce checkout link is not available');
  });
});
