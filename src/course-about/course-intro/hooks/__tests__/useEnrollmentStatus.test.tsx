import { IntlProvider } from '@edx/frontend-platform/i18n';

import {
  cleanup, renderHook, render, screen,
} from '@src/setupTest';
import { mockCourseAboutResponse } from '@src/__mocks__';
import { ALERT_VARIANTS } from '../../constants';
import { getLearningHomePageUrl } from '../../utils';
import messages from '../../messages';
import { useEnrollmentStatus } from '../useEnrollmentStatus';

const wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={{}}>
    {children}
  </IntlProvider>
);

describe('useEnrollmentStatus', () => {
  const mockCourseAboutData = {
    ...mockCourseAboutResponse,
    showCoursewareLink: true,
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
      enrollmentError: messages.statusAlertEnrollmentError.defaultMessage,
    }), { wrapper });

    render(result.current.renderStatusContent());

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(`alert-${ALERT_VARIANTS.DANGER}`);
    expect(alert).toHaveTextContent(messages.statusAlertEnrollmentError.defaultMessage);
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

    const alert = screen.getByRole('alert');

    expect(alert).toHaveClass(`alert-${ALERT_VARIANTS.SUCCESS}`);
    expect(alert).toHaveTextContent(messages.statusAlertEnrolled.defaultMessage);

    const viewCourseButton = screen.getByRole('link', { name: messages.viewCourseBtn.defaultMessage });
    expect(viewCourseButton).toHaveAttribute('href', getLearningHomePageUrl(mockCourseAboutResponse.id));
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

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(`alert-${ALERT_VARIANTS.INFO}`);
    expect(alert).toHaveTextContent(messages.statusAlertFull.defaultMessage);
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

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(`alert-${ALERT_VARIANTS.INFO}`);
    expect(alert).toHaveTextContent(messages.statusAlertEnrollmentInvitationOnly.defaultMessage);
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

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(`alert-${ALERT_VARIANTS.INFO}`);
    expect(alert).toHaveTextContent(messages.statusAlertEnrollmentClosed.defaultMessage);
  });

  it('renders enrollment button for eligible users', () => {
    const { result } = renderHook(() => useEnrollmentStatus(mockProps), { wrapper });

    render(result.current.renderStatusContent());

    const enrollButton = screen.getByRole('button', { name: messages.enrollNowBtn.defaultMessage });
    expect(enrollButton).toHaveClass('btn-primary');
    expect(enrollButton).toHaveTextContent(messages.enrollNowBtn.defaultMessage);
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

    render(result.current.renderStatusContent());

    const viewCourseButton = screen.getByRole('link', { name: messages.viewCourseBtn.defaultMessage });
    expect(viewCourseButton).toHaveAttribute('href', getLearningHomePageUrl(mockCourseAboutData.id));
  });

  it('shows pending state on enrollment button when enrollment is pending', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      isEnrollmentPending: true,
    }), { wrapper });

    render(result.current.renderStatusContent());

    const enrollButton = screen.getByRole('button', { name: messages.enrollNowBtnPending.defaultMessage });
    expect(enrollButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles ecommerce checkout mode correctly', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      courseAboutData: {
        ...mockCourseAboutData,
        ecommerceCheckout: true,
      },
    }), { wrapper });

    render(result.current.renderStatusContent());

    const enrollButton = screen.getByRole('button', { name: messages.enrollNowBtn.defaultMessage });
    expect(enrollButton).toHaveTextContent(messages.enrollNowBtn.defaultMessage);
  });
});
