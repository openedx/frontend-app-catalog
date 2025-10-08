import { useLocation } from 'react-router-dom';

import genericMessages from '../generic/video-modal/messages';
import {
  render, waitFor, screen, userEvent,
} from '../setupTest';
import { mockCourseAboutResponse } from '../__mocks__';
import CourseAboutPage from './CourseAboutPage';
import { fetchCourseAboutData } from './data/api';
import messages from './course-intro/messages';
import courseMediaMessages from './course-intro/course-media/messages';

const mockGetAuthenticatedUser = jest.fn();

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

jest.mock('./data/api', () => ({
  fetchCourseAboutData: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

const mockFetchCourseAboutData = fetchCourseAboutData as jest.Mock;
const mockUseLocation = useLocation as jest.Mock;

describe('CourseAboutPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({
      pathname: '/catalog/course-v1:TestX+Test101+2023/about',
    });
    mockGetAuthenticatedUser.mockReturnValue(null);
  });

  it('should show loading state when data is being fetched', async () => {
    mockFetchCourseAboutData.mockReturnValue(new Promise(() => {}));
    render(<CourseAboutPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render course page with all components', async () => {
    mockFetchCourseAboutData.mockReturnValue(mockCourseAboutResponse);
    render(<CourseAboutPage />);

    await waitFor(() => {
      expect(screen.getByText(mockCourseAboutResponse.name)).toBeInTheDocument();
      expect(screen.getByText(mockCourseAboutResponse.displayOrgWithDefault)).toBeInTheDocument();
      expect(screen.getByText(mockCourseAboutResponse.shortDescription)).toBeInTheDocument();

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByAltText(mockCourseAboutResponse.name)).toBeInTheDocument();
    });
  });

  it('should handle course with video correctly', async () => {
    const courseWithVideo = {
      ...mockCourseAboutResponse,
      media: {
        ...mockCourseAboutResponse.media,
        courseVideo: {
          uri: 'https://www.youtube.com/watch?v=test123',
        },
      },
    };

    mockFetchCourseAboutData.mockReturnValue(courseWithVideo);

    render(<CourseAboutPage />);

    await waitFor(() => {
      const videoButton = screen.getByLabelText(courseMediaMessages.playCourseIntroductionVideo.defaultMessage);
      expect(videoButton).toBeInTheDocument();
    });

    const videoButton = screen.getByLabelText(courseMediaMessages.playCourseIntroductionVideo.defaultMessage);

    await userEvent.click(videoButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTitle(genericMessages.videoIframeTitle.defaultMessage)).toBeInTheDocument();
    });
  });

  it('should handle course without video correctly', async () => {
    const courseWithoutVideo = {
      ...mockCourseAboutResponse,
      media: {
        ...mockCourseAboutResponse.media,
        courseVideo: {
          uri: null,
        },
      },
    };

    mockFetchCourseAboutData.mockReturnValue(courseWithoutVideo);

    render(<CourseAboutPage />);

    await waitFor(() => {
      expect(screen.queryByLabelText(
        courseMediaMessages.playCourseIntroductionVideo.defaultMessage,
      )).not.toBeInTheDocument();
    });
  });

  it('should display enrollment button for non-enrolled user', async () => {
    const courseData = {
      ...mockCourseAboutResponse,
      enrollment: { isActive: false },
      canEnroll: true,
    };

    mockFetchCourseAboutData.mockReturnValue(courseData);

    render(<CourseAboutPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', {
        name: messages.enrollNowBtn.defaultMessage,
      })).toBeInTheDocument();
    });
  });

  it('should display enrolled status for enrolled user', async () => {
    mockGetAuthenticatedUser.mockReturnValue({ username: 'testuser' });

    const courseData = {
      ...mockCourseAboutResponse,
      enrollment: { isActive: true },
      showCoursewareLink: true,
    };

    mockFetchCourseAboutData.mockReturnValue(courseData);

    render(<CourseAboutPage />);

    await waitFor(() => {
      expect(screen.getByText(messages.statusMessageEnrolled.defaultMessage)).toBeInTheDocument();
    });
  });

  it('should handle course full scenario', async () => {
    const courseData = {
      ...mockCourseAboutResponse,
      isCourseFull: true,
      canEnroll: false,
    };

    mockFetchCourseAboutData.mockReturnValue(courseData);

    render(<CourseAboutPage />);

    await waitFor(() => {
      expect(screen.getByText(messages.statusMessageFull.defaultMessage)).toBeInTheDocument();
    });
  });
});
