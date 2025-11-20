import { useLocation } from 'react-router-dom';
import { useMediaQuery } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import genericMessages from '../generic/video-modal/messages';
import {
  render, waitFor, screen, userEvent, within,
} from '../setupTest';
import { mockCourseAboutResponse } from '../__mocks__';
import CourseAboutPage from './CourseAboutPage';
import { fetchCourseAboutData } from './data/api';
import messages from './course-intro/messages';
import courseMediaMessages from './course-intro/course-media/messages';
import sidebarDetailsMessages from './course-sidebar/sidebar-details/messages';
import sidebarSocialMessages from './course-sidebar/sidebar-social/messages';
import { ROUTES } from '../routes';
import courseAboutMessages from './messages';

const mockGetAuthenticatedUser = jest.fn();

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('./data/api', () => ({
  fetchCourseAboutData: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

jest.mock('@openedx/paragon', () => ({
  ...jest.requireActual('@openedx/paragon'),
  useMediaQuery: jest.fn(),
}));

const mockUseMediaQuery = useMediaQuery as jest.Mock;
const mockGetConfig = getConfig as jest.Mock;
const mockFetchCourseAboutData = fetchCourseAboutData as jest.Mock;
const mockUseLocation = useLocation as jest.Mock;

describe('CourseAboutPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({
      pathname: ROUTES.COURSE_ABOUT.replace(':courseId', 'course-v1:TestX+Test101+2023'),
    });
    mockGetAuthenticatedUser.mockReturnValue(null);
    mockUseMediaQuery.mockReturnValue(false);
    mockGetConfig.mockReturnValue({
      LMS_BASE_URL: process.env.LMS_BASE_URL,
      STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
    });
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

  describe('Course sidebar', () => {
    describe('Sidebar details', () => {
      it('should render course sidebar with course details', async () => {
        const courseData = {
          ...mockCourseAboutResponse,
          displayNumberWithDefault: 'CS101',
          effort: '6-8 hours per week',
          requirements: 'Basic programming knowledge',
          coursePrice: '$99',
        };

        mockFetchCourseAboutData.mockReturnValue(courseData);

        render(<CourseAboutPage />);

        await waitFor(() => {
          const sidebar = screen.getByRole('complementary');
          expect(within(sidebar).getByText(courseData.displayNumberWithDefault)).toBeInTheDocument();
          expect(within(sidebar).getByText(courseData.effort)).toBeInTheDocument();
          expect(within(sidebar).getByText(courseData.requirements)).toBeInTheDocument();
          expect(within(sidebar).getByText(courseData.coursePrice)).toBeInTheDocument();
        });
      });

      it('should display start date in sidebar when not default', async () => {
        const courseData = {
          ...mockCourseAboutResponse,
          startDateIsStillDefault: false,
          start: '2024-03-15T00:00:00Z',
        };

        mockFetchCourseAboutData.mockReturnValue(courseData);

        render(<CourseAboutPage />);

        await waitFor(() => {
          const sidebar = screen.getByRole('complementary');
          expect(within(sidebar).getByText('Mar 15, 2024')).toBeInTheDocument();
        });
      });

      it('should display end date in sidebar when available', async () => {
        const courseData = {
          ...mockCourseAboutResponse,
          end: '2024-06-15T00:00:00Z',
        };

        mockFetchCourseAboutData.mockReturnValue(courseData);

        render(<CourseAboutPage />);

        await waitFor(() => {
          const sidebar = screen.getByRole('complementary');
          expect(within(sidebar).getByText('Jun 15, 2024')).toBeInTheDocument();
        });
      });

      it('should not display effort when not provided', async () => {
        const courseData = {
          ...mockCourseAboutResponse,
          effort: null,
        };

        mockFetchCourseAboutData.mockReturnValue(courseData);

        render(<CourseAboutPage />);

        await waitFor(() => {
          const sidebar = screen.getByRole('complementary');
          expect(
            within(sidebar).queryByText(sidebarDetailsMessages.estimatedEffort.defaultMessage),
          ).not.toBeInTheDocument();
        });
      });

      it('should not display requirements when not provided', async () => {
        const courseData = {
          ...mockCourseAboutResponse,
          requirements: null,
        };

        mockFetchCourseAboutData.mockReturnValue(courseData);

        render(<CourseAboutPage />);

        await waitFor(() => {
          const sidebar = screen.getByRole('complementary');
          expect(
            within(sidebar).queryByText(sidebarDetailsMessages.requirements.defaultMessage),
          ).not.toBeInTheDocument();
        });
      });
    });

    describe('Sidebar social', () => {
      it('should display social sharing options in sidebar', async () => {
        mockFetchCourseAboutData.mockReturnValue(mockCourseAboutResponse);

        render(<CourseAboutPage />);

        await waitFor(() => {
          const sidebar = screen.getByRole('complementary');

          expect(within(sidebar).getByText(
            sidebarSocialMessages.socialSharingTwitter.defaultMessage,
          )).toBeInTheDocument();
          expect(within(sidebar).getByText(
            sidebarSocialMessages.socialSharingFacebook.defaultMessage,
          )).toBeInTheDocument();
          expect(within(sidebar).getByText(
            sidebarSocialMessages.socialSharingEmail.defaultMessage,
          )).toBeInTheDocument();
        });
      });

      it('should have correct Twitter share URL in sidebar', async () => {
        const courseData = {
          ...mockCourseAboutResponse,
          displayNumberWithDefault: 'CS101',
          name: 'Test Course',
        };

        mockFetchCourseAboutData.mockReturnValue(courseData);

        render(<CourseAboutPage />);

        await waitFor(() => {
          const sidebar = screen.getByRole('complementary');
          const twitterLink = within(sidebar).getByText(
            sidebarSocialMessages.socialSharingTwitter.defaultMessage,
          ).closest('a');

          expect(twitterLink).toHaveAttribute('href', expect.stringContaining('twitter.com/intent/tweet'));
          expect(twitterLink?.getAttribute('href')).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
          expect(twitterLink?.getAttribute('href')).toContain(encodeURIComponent(courseData.name));
        });
      });

      it('should have correct Facebook share URL in sidebar', async () => {
        mockFetchCourseAboutData.mockReturnValue(mockCourseAboutResponse);

        render(<CourseAboutPage />);

        await waitFor(() => {
          const sidebar = screen.getByRole('complementary');
          const facebookLink = within(sidebar).getByText(
            sidebarSocialMessages.socialSharingFacebook.defaultMessage,
          ).closest('a');

          expect(facebookLink).toHaveAttribute('href', expect.stringContaining('facebook.com/sharer/sharer.php'));
        });
      });

      it('should have correct Email share URL in sidebar', async () => {
        const courseData = {
          ...mockCourseAboutResponse,
          displayNumberWithDefault: 'MATH201',
          name: 'Advanced Mathematics',
        };

        mockFetchCourseAboutData.mockReturnValue(courseData);

        render(<CourseAboutPage />);

        await waitFor(() => {
          const sidebar = screen.getByRole('complementary');
          const emailLink = within(sidebar).getByText(
            sidebarSocialMessages.socialSharingEmail.defaultMessage,
          ).closest('a');

          expect(emailLink).toHaveAttribute('href', expect.stringContaining('mailto:'));
          expect(emailLink?.getAttribute('href')).toContain(encodeURIComponent(courseData.displayNumberWithDefault));
          expect(emailLink?.getAttribute('href')).toContain(encodeURIComponent(courseData.name));
        });
      });
    });
  });

  describe('Responsive layout', () => {
    beforeEach(() => {
      mockFetchCourseAboutData.mockReturnValue(mockCourseAboutResponse);
    });

    it('should render mobile layout for small screens', async () => {
      mockUseMediaQuery.mockReturnValue(true);

      render(<CourseAboutPage />);

      await waitFor(() => {
        expect(screen.getByText(mockCourseAboutResponse.name)).toBeInTheDocument();
        expect(screen.getByText(mockCourseAboutResponse.displayOrgWithDefault)).toBeInTheDocument();

        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toBeInTheDocument();

        expect(screen.getByAltText(mockCourseAboutResponse.name)).toBeInTheDocument();
      });
    });

    it('should render desktop layout for large screens', async () => {
      mockUseMediaQuery.mockReturnValue(false);

      render(<CourseAboutPage />);

      await waitFor(() => {
        expect(screen.getByText(mockCourseAboutResponse.name)).toBeInTheDocument();
        expect(screen.getByText(mockCourseAboutResponse.displayOrgWithDefault)).toBeInTheDocument();

        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toBeInTheDocument();

        expect(screen.getByAltText(mockCourseAboutResponse.name)).toBeInTheDocument();
      });
    });

    it('should apply correct CSS classes for mobile layout', async () => {
      mockUseMediaQuery.mockReturnValue(true);

      render(<CourseAboutPage />);

      await waitFor(() => {
        const mediaWrapper = document.querySelector('.course-media-wrapper.text-center');
        expect(mediaWrapper).toBeInTheDocument();
      });
    });

    it('should apply correct CSS classes for desktop layout', async () => {
      mockUseMediaQuery.mockReturnValue(false);

      render(<CourseAboutPage />);

      await waitFor(() => {
        const mediaWrapper = document.querySelector('.course-media-wrapper.text-center');
        expect(mediaWrapper).not.toBeInTheDocument();

        const mediaWrapperWithoutCenter = document.querySelector('.course-media-wrapper:not(.text-center)');
        expect(mediaWrapperWithoutCenter).toBeInTheDocument();
      });
    });
  });

  describe('Course overview', () => {
    it('should render course overview with content', async () => {
      const courseOverviewText = 'Course overview content';
      const courseData = {
        ...mockCourseAboutResponse,
        overview: `<p>${courseOverviewText}</p>`,
      };

      mockFetchCourseAboutData.mockReturnValue(courseData);
      render(<CourseAboutPage />);

      await waitFor(() => {
        expect(screen.getByText(courseOverviewText)).toBeInTheDocument();
      });
    });

    it('should not render course overview for non-staff user when overview is empty', async () => {
      const courseData = {
        ...mockCourseAboutResponse,
        overview: '',
      };

      mockFetchCourseAboutData.mockReturnValue(courseData);
      render(<CourseAboutPage />);

      await waitFor(() => {
        expect(screen.queryByRole('link', {
          name: courseAboutMessages.viewAboutPageInStudio.defaultMessage,
        })).not.toBeInTheDocument();
      });
    });

    it('should process overview content to replace image paths', async () => {
      const courseData = {
        ...mockCourseAboutResponse,
        overview: '<img src="/static/images/test.jpg" alt="Test Image" />',
      };

      mockFetchCourseAboutData.mockReturnValue(courseData);
      render(<CourseAboutPage />);

      await waitFor(() => {
        const img = screen.getByAltText('Test Image');
        expect(img).toHaveAttribute('src', `${getConfig().LMS_BASE_URL}/static/images/test.jpg`);
      });
    });

    it('should process overview content with asset paths', async () => {
      const courseData = {
        ...mockCourseAboutResponse,
        overview: '<img src="/asset/test.jpg" alt="Test Asset" />',
      };

      mockFetchCourseAboutData.mockReturnValue(courseData);
      render(<CourseAboutPage />);

      await waitFor(() => {
        const img = screen.getByAltText('Test Asset');
        expect(img).toHaveAttribute('src', `${getConfig().LMS_BASE_URL}/asset/test.jpg`);
      });
    });

    it('should show Studio button for global staff user', async () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });

      const courseData = {
        ...mockCourseAboutResponse,
        overview: '<p>Course overview content</p>',
      };

      mockFetchCourseAboutData.mockReturnValue(courseData);
      render(<CourseAboutPage />);

      await waitFor(() => {
        const studioButton = screen.getByRole('link', {
          name: courseAboutMessages.viewAboutPageInStudio.defaultMessage,
        });
        expect(studioButton).toBeInTheDocument();
        expect(studioButton).toHaveAttribute(
          'href',
          expect.stringContaining(`${getConfig().STUDIO_BASE_URL}/settings/details/`),
        );
      });
    });

    it('should hide Studio button for non-staff user', async () => {
      mockGetAuthenticatedUser.mockReturnValue(null);

      const courseData = {
        ...mockCourseAboutResponse,
        overview: '<p>Course overview content</p>',
      };

      mockFetchCourseAboutData.mockReturnValue(courseData);
      render(<CourseAboutPage />);

      await waitFor(() => {
        expect(screen.queryByRole('link', {
          name: courseAboutMessages.viewAboutPageInStudio.defaultMessage,
        })).not.toBeInTheDocument();
      });
    });

    it('should hide Studio button for authenticated user without administrator role', async () => {
      mockGetAuthenticatedUser.mockReturnValue({ username: 'testuser', administrator: false });

      const courseData = {
        ...mockCourseAboutResponse,
        overview: '<p>Course overview content</p>',
      };

      mockFetchCourseAboutData.mockReturnValue(courseData);
      render(<CourseAboutPage />);

      await waitFor(() => {
        expect(screen.queryByRole('link', {
          name: courseAboutMessages.viewAboutPageInStudio.defaultMessage,
        })).not.toBeInTheDocument();
      });
    });
  });
});
