import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getAuthenticatedUser, getSiteConfig, IntlProvider } from '@openedx/frontend-base';

import { mockCourseAboutResponse } from '@src/__mocks__';
import { useEnrollment } from '@src/course-about/data/hooks';
import { CourseIntro } from './CourseIntro';
import messages from './messages';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedUser: jest.fn(),
  logError: jest.fn(),
}));

jest.mock('@src/course-about/data/hooks', () => ({
  useEnrollment: jest.fn(),
}));

const renderCourseIntro = (props: React.ComponentProps<typeof CourseIntro>) => render(
  <IntlProvider locale="en"><CourseIntro {...props} /></IntlProvider>,
);

describe('CourseIntro', () => {
  const mockEnrollAndRedirect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthenticatedUser as jest.Mock).mockReturnValue(null);
    (useEnrollment as jest.Mock).mockReturnValue(mockEnrollAndRedirect);
  });

  it('renders course information correctly', () => {
    renderCourseIntro({ courseAboutData: mockCourseAboutResponse });

    expect(screen.getByText(mockCourseAboutResponse.name)).toBeInTheDocument();
    expect(screen.getByText(mockCourseAboutResponse.org)).toBeInTheDocument();
    expect(screen.getByText(mockCourseAboutResponse.shortDescription)).toBeInTheDocument();
  });

  it('renders enrollment button for eligible users', async () => {
    renderCourseIntro({ courseAboutData: mockCourseAboutResponse });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: messages.enrollNowBtn.defaultMessage })).toBeInTheDocument();
    });
  });

  it('handles enrollment action correctly', async () => {
    mockEnrollAndRedirect.mockResolvedValueOnce(undefined);
    renderCourseIntro({ courseAboutData: mockCourseAboutResponse });

    const enrollButton = await screen.findByRole('button', { name: messages.enrollNowBtn.defaultMessage });
    userEvent.click(enrollButton);

    await waitFor(() => {
      expect(mockEnrollAndRedirect).toHaveBeenCalledWith(
        mockCourseAboutResponse.id,
        `${getSiteConfig().lmsBaseUrl}/dashboard`,
      );
    });
  });

  it('renders enrolled status for authenticated active users', async () => {
    (getAuthenticatedUser as jest.Mock).mockReturnValue({ username: 'testuser' });
    const enrolledCourseData = {
      ...mockCourseAboutResponse,
      enrollment: { isActive: true },
    };

    renderCourseIntro({ courseAboutData: enrolledCourseData });

    await waitFor(() => {
      expect(screen.getByText(messages.statusMessageEnrolled.defaultMessage)).toBeInTheDocument();
    });
  });

  it('handles authenticated user correctly', async () => {
    const mockUser = { username: 'testuser' };
    (getAuthenticatedUser as jest.Mock).mockReturnValue(mockUser);

    renderCourseIntro({ courseAboutData: mockCourseAboutResponse });

    await waitFor(() => {
      expect(screen.getByRole('button', {
        name: messages.enrollNowBtn.defaultMessage,
      })).toBeInTheDocument();
    });
  });
});
