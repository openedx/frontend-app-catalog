import { IntlProvider } from '@edx/frontend-platform/i18n';

import { cleanup, renderHook, render } from '../../../../setupTest';
import { StatusAlert, EnrolledStatus, EnrollmentButton } from '../../components';
import { ALERT_VARIANTS } from '../../constants';
import { getLearningHomePageUrl } from '../../utils';
import { useEnrollmentStatus } from '../useEnrollmentStatus';

jest.mock('../../components', () => ({
  StatusAlert: jest.fn(() => null),
  EnrolledStatus: jest.fn(() => null),
  EnrollmentButton: jest.fn(() => null),
}));

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => ({
    LEARNING_BASE_URL: 'http://learning.example.com',
  })),
}));

const wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={{}}>
    {children}
  </IntlProvider>
);

describe('useEnrollmentStatus', () => {
  const mockCourseAboutData = {
    id: 'course-v1:test+course+1',
    name: 'Test Course',
    org: 'Test Org',
    shortDescription: 'Test Description',
    enrollment: { isActive: false },
    isCourseFull: false,
    invitationOnly: false,
    canEnroll: true,
    isShibCourse: false,
    allowAnonymous: false,
    showCoursewareLink: true,
    singlePaidMode: {},
    ecommerceCheckout: false,
    ecommerceCheckoutLink: '',
  };

  const mockProps = {
    courseAboutData: mockCourseAboutData,
    enrollmentError: null,
    authenticatedUser: null,
    isEnrollmentPending: false,
    handleChangeEnrollment: jest.fn(),
    handleEcommerceCheckout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('renders enrollment error alert when there is an error', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      enrollmentError: 'Enrollment failed',
    }), { wrapper });

    render(result.current.renderStatusContent());

    expect(StatusAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: ALERT_VARIANTS.DANGER,
        messageKey: 'statusAlertEnrollmentError',
      }),
      expect.any(Object),
    );
  });

  it('renders enrolled status for authenticated active users', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      authenticatedUser: { username: 'testuser' },
      courseAboutData: {
        ...mockCourseAboutData,
        enrollment: { isActive: true },
      },
    }), { wrapper });

    render(result.current.renderStatusContent());

    expect(EnrolledStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        showCoursewareLink: true,
        courseId: 'course-v1:test+course+1',
      }),
      expect.any(Object),
    );
  });

  it('renders full course alert when course is full', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      courseAboutData: {
        ...mockCourseAboutData,
        isCourseFull: true,
      },
    }), { wrapper });

    render(result.current.renderStatusContent());

    expect(StatusAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: ALERT_VARIANTS.INFO,
        messageKey: 'statusAlertFull',
      }),
      expect.any(Object),
    );
  });

  it('renders invitation only alert when course is invitation only and user cannot enroll', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      courseAboutData: {
        ...mockCourseAboutData,
        invitationOnly: true,
        canEnroll: false,
      },
    }), { wrapper });

    render(result.current.renderStatusContent());

    expect(StatusAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: ALERT_VARIANTS.INFO,
        messageKey: 'statusAlertEnrollmentInvitationOnly',
      }),
      expect.any(Object),
    );
  });

  it('renders enrollment closed alert when course is not shib and user cannot enroll', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      courseAboutData: {
        ...mockCourseAboutData,
        isShibCourse: false,
        canEnroll: false,
      },
    }), { wrapper });

    render(result.current.renderStatusContent());

    expect(StatusAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: ALERT_VARIANTS.INFO,
        messageKey: 'statusAlertEnrollmentClosed',
      }),
      expect.any(Object),
    );
  });

  it('renders enrollment button for eligible users', () => {
    const { result } = renderHook(() => useEnrollmentStatus(mockProps), { wrapper });

    render(result.current.renderStatusContent());

    expect(EnrollmentButton).toHaveBeenCalledWith(
      expect.objectContaining({
        singlePaidMode: {},
        ecommerceCheckout: false,
        isEnrollmentPending: false,
        onEnroll: mockProps.handleChangeEnrollment,
        onEcommerceCheckout: mockProps.handleEcommerceCheckout,
      }),
      expect.any(Object),
    );
  });

  it('renders view course button for anonymous users when course allows anonymous access', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      courseAboutData: {
        ...mockCourseAboutData,
        allowAnonymous: true,
        showCoursewareLink: true,
      },
    }), { wrapper });

    const { container } = render(result.current.renderStatusContent());

    const expectedUrl = getLearningHomePageUrl(mockCourseAboutData.id);
    expect(expectedUrl).toBe('http://learning.example.com/learning/course/course-v1:test+course+1/home');

    expect(container.querySelector('a')).toBeInTheDocument();
    expect(container.querySelector('a')).toHaveAttribute('href', expectedUrl);
  });
});
