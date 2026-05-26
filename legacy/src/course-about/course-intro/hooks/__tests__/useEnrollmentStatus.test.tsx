import { IntlProvider } from '@edx/frontend-platform/i18n';

import {
  cleanup, renderHook, render, screen,
} from '@src/setupTest';
import { mockCourseAboutResponse } from '@src/__mocks__';
import { STATUS_MESSAGE_VARIANTS } from '../../constants';
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

  it('renders enrollment error status message when there is an error', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      enrollmentError: messages.statusMessageEnrollmentError.defaultMessage,
    }), { wrapper });

    render(result.current.renderStatusContent());

    const statusMessage = screen.getByRole('status');
    expect(statusMessage).toHaveClass(`text-${STATUS_MESSAGE_VARIANTS.DANGER}-500`);
    expect(statusMessage).toHaveTextContent(messages.statusMessageEnrollmentError.defaultMessage);
  });

  it('renders enrolled status message for authenticated active users', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      authenticatedUser: { username: 'testuser' },
      courseAboutData: {
        ...mockCourseAboutData,
        enrollment: { isActive: true },
      },
    }), { wrapper });

    render(result.current.renderStatusContent());

    const statusMessage = screen.getByRole('status');

    expect(statusMessage).toHaveClass(`text-${STATUS_MESSAGE_VARIANTS.SUCCESS}-500`);
    expect(statusMessage).toHaveTextContent(messages.statusMessageEnrolled.defaultMessage);

    const viewCourseButton = screen.getByRole('link', { name: messages.viewCourseBtn.defaultMessage });
    expect(viewCourseButton).toHaveAttribute('href', getLearningHomePageUrl(mockCourseAboutResponse.id));
  });

  it('renders full course status message when course is full', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      courseAboutData: {
        ...mockCourseAboutData,
        isCourseFull: true,
      },
    }), { wrapper });

    render(result.current.renderStatusContent());

    const statusMessage = screen.getByRole('status');
    expect(statusMessage).toHaveClass(`text-${STATUS_MESSAGE_VARIANTS.INFO}-500`);
    expect(statusMessage).toHaveTextContent(messages.statusMessageFull.defaultMessage);
  });

  it('renders invitation only status message when course is invitation only and user cannot enroll', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      courseAboutData: {
        ...mockCourseAboutData,
        invitationOnly: true,
        canEnroll: false,
      },
    }), { wrapper });

    render(result.current.renderStatusContent());

    const statusMessage = screen.getByRole('status');
    expect(statusMessage).toHaveClass(`text-${STATUS_MESSAGE_VARIANTS.INFO}-500`);
    expect(statusMessage).toHaveTextContent(messages.statusMessageEnrollmentInvitationOnly.defaultMessage);
  });

  it('renders enrollment closed status message when course is not shib and user cannot enroll', () => {
    const { result } = renderHook(() => useEnrollmentStatus({
      ...mockProps,
      courseAboutData: {
        ...mockCourseAboutData,
        isShibCourse: false,
        canEnroll: false,
      },
    }), { wrapper });

    render(result.current.renderStatusContent());

    const statusMessage = screen.getByRole('status');
    expect(statusMessage).toHaveClass(`text-${STATUS_MESSAGE_VARIANTS.INFO}-500`);
    expect(statusMessage).toHaveTextContent(messages.statusMessageEnrollmentClosed.defaultMessage);
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
