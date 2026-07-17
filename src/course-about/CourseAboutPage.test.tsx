import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useParams } from 'react-router';
import { useMediaQuery } from '@openedx/paragon';
import {
  getAuthenticatedUser, getSiteConfig, IntlProvider,
} from '@openedx/frontend-base';

import { mockCourseAboutResponse } from '@src/__mocks__';
import { DATE_FORMAT_OPTIONS } from '@src/constants';
import genericMessages from '../generic/video-modal/messages';
import CourseAboutPage from './CourseAboutPage';
import { useCourseAboutData, useEnrollment } from './data/hooks';
import messages from './course-intro/messages';
import courseMediaMessages from './course-intro/course-media/messages';
import sidebarDetailsMessages from './course-sidebar/sidebar-details/messages';
import sidebarSocialMessages from './course-sidebar/sidebar-social/messages';
import courseAboutMessages from './messages';

const TEST_COURSE_ID = 'course-v1:TestX+Test101+2023';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedUser: jest.fn(),
  getUrlByRouteRole: jest.fn(() => '/courses/:courseId/about'),
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn(),
}));

jest.mock('@openedx/paragon', () => ({
  ...jest.requireActual('@openedx/paragon'),
  useMediaQuery: jest.fn(),
}));

jest.mock('./data/hooks', () => ({
  useCourseAboutData: jest.fn(),
  useEnrollment: jest.fn(),
}));

const mockUseMediaQuery = useMediaQuery as jest.Mock;
const mockedGetAuthenticatedUser = getAuthenticatedUser as jest.Mock;
const mockUseParams = useParams as jest.Mock;
const mockUseCourseAboutData = useCourseAboutData as jest.Mock;
const mockUseEnrollment = useEnrollment as jest.Mock;

const formatDateForTest = (dateString: string) => new Intl.DateTimeFormat(
  'en-US',
  DATE_FORMAT_OPTIONS,
).format(new Date(dateString));

const renderCourseAboutPage = () => render(
  <IntlProvider locale="en"><MemoryRouter><CourseAboutPage /></MemoryRouter></IntlProvider>,
);

describe('CourseAboutPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ courseId: TEST_COURSE_ID });
    mockedGetAuthenticatedUser.mockReturnValue(null);
    mockUseMediaQuery.mockReturnValue(false);
    mockUseEnrollment.mockReturnValue(jest.fn());
  });

  const setCourseData = (courseData: any, overrides: Partial<{ isLoading: boolean; isError: boolean }> = {}) => {
    mockUseCourseAboutData.mockReturnValue({
      data: courseData,
      isLoading: false,
      isError: false,
      ...overrides,
    });
  };

  it('sets correct document title', async () => {
    setCourseData(mockCourseAboutResponse);

    renderCourseAboutPage();

    await waitFor(() => {
      expect(document.title).toBe(
        courseAboutMessages.pageTitle.defaultMessage
          .replace('{courseName}', mockCourseAboutResponse.name)
          .replace('{siteName}', getSiteConfig().siteName),
      );
    });
  });

  it('should show loading state when data is being fetched', () => {
    setCourseData(undefined, { isLoading: true });
    renderCourseAboutPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render course page with all components', async () => {
    setCourseData(mockCourseAboutResponse);
    renderCourseAboutPage();

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

    setCourseData(courseWithVideo);

    renderCourseAboutPage();

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

    setCourseData(courseWithoutVideo);
    renderCourseAboutPage();

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

    setCourseData(courseData);
    renderCourseAboutPage();

    await waitFor(() => {
      expect(screen.getByRole('button', {
        name: messages.enrollNowBtn.defaultMessage,
      })).toBeInTheDocument();
    });
  });

  it('should display enrolled status for enrolled user', async () => {
    mockedGetAuthenticatedUser.mockReturnValue({ username: 'testuser' });

    const courseData = {
      ...mockCourseAboutResponse,
      enrollment: { isActive: true },
      showCoursewareLink: true,
    };

    setCourseData(courseData);
    renderCourseAboutPage();

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

    setCourseData(courseData);
    renderCourseAboutPage();

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

        setCourseData(courseData);
        renderCourseAboutPage();

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

        setCourseData(courseData);
        renderCourseAboutPage();

        await waitFor(() => {
          const sidebar = screen.getByRole('complementary');
          expect(within(sidebar).getByText(formatDateForTest('2024-03-15T00:00:00Z'))).toBeInTheDocument();
        });
      });

      it('should display end date in sidebar when available', async () => {
        const courseData = {
          ...mockCourseAboutResponse,
          end: '2024-06-15T00:00:00Z',
        };

        setCourseData(courseData);
        renderCourseAboutPage();

        await waitFor(() => {
          const sidebar = screen.getByRole('complementary');
          expect(within(sidebar).getByText(formatDateForTest('2024-06-15T00:00:00Z'))).toBeInTheDocument();
        });
      });

      it('should not display effort when not provided', async () => {
        const courseData = {
          ...mockCourseAboutResponse,
          effort: null,
        };

        setCourseData(courseData);
        renderCourseAboutPage();

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

        setCourseData(courseData);
        renderCourseAboutPage();

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
        setCourseData(mockCourseAboutResponse);
        renderCourseAboutPage();

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

        setCourseData(courseData);
        renderCourseAboutPage();

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
        setCourseData(mockCourseAboutResponse);
        renderCourseAboutPage();

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

        setCourseData(courseData);
        renderCourseAboutPage();

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
      setCourseData(mockCourseAboutResponse);
    });

    it('should render mobile layout for small screens', async () => {
      mockUseMediaQuery.mockReturnValue(true);

      renderCourseAboutPage();

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

      renderCourseAboutPage();

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

      renderCourseAboutPage();

      await waitFor(() => {
        const mediaWrapper = document.querySelector('.course-media-wrapper.text-center');
        expect(mediaWrapper).toBeInTheDocument();
      });
    });

    it('should apply correct CSS classes for desktop layout', async () => {
      mockUseMediaQuery.mockReturnValue(false);

      renderCourseAboutPage();

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

      setCourseData(courseData);
      renderCourseAboutPage();

      await waitFor(() => {
        expect(screen.getByText(courseOverviewText)).toBeInTheDocument();
      });
    });

    it('should not render course overview for non-staff user when overview is empty', async () => {
      const courseData = {
        ...mockCourseAboutResponse,
        overview: '',
      };

      setCourseData(courseData);
      renderCourseAboutPage();

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

      setCourseData(courseData);
      renderCourseAboutPage();

      await waitFor(() => {
        const img = screen.getByAltText('Test Image');
        expect(img).toHaveAttribute('src', `${getSiteConfig().lmsBaseUrl}/static/images/test.jpg`);
      });
    });

    it('should process overview content with asset paths', async () => {
      const courseData = {
        ...mockCourseAboutResponse,
        overview: '<img src="/asset/test.jpg" alt="Test Asset" />',
      };

      setCourseData(courseData);
      renderCourseAboutPage();

      await waitFor(() => {
        const img = screen.getByAltText('Test Asset');
        expect(img).toHaveAttribute('src', `${getSiteConfig().lmsBaseUrl}/asset/test.jpg`);
      });
    });

    it('should show Studio button for global staff user', async () => {
      mockedGetAuthenticatedUser.mockReturnValue({ administrator: true });

      const courseData = {
        ...mockCourseAboutResponse,
        overview: '<p>Course overview content</p>',
      };

      setCourseData(courseData);
      renderCourseAboutPage();

      await waitFor(() => {
        const studioButton = screen.getByRole('link', {
          name: courseAboutMessages.viewAboutPageInStudio.defaultMessage,
        });
        expect(studioButton).toBeInTheDocument();
        expect(studioButton).toHaveAttribute(
          'href',
          expect.stringContaining(`${getSiteConfig().cmsBaseUrl}/settings/details/`),
        );
      });
    });

    it('should hide Studio button for non-staff user', async () => {
      mockedGetAuthenticatedUser.mockReturnValue(null);

      const courseData = {
        ...mockCourseAboutResponse,
        overview: '<p>Course overview content</p>',
      };

      setCourseData(courseData);
      renderCourseAboutPage();

      await waitFor(() => {
        expect(screen.queryByRole('link', {
          name: courseAboutMessages.viewAboutPageInStudio.defaultMessage,
        })).not.toBeInTheDocument();
      });
    });

    it('should hide Studio button for authenticated user without administrator role', async () => {
      mockedGetAuthenticatedUser.mockReturnValue({ username: 'testuser', administrator: false });

      const courseData = {
        ...mockCourseAboutResponse,
        overview: '<p>Course overview content</p>',
      };

      setCourseData(courseData);
      renderCourseAboutPage();

      await waitFor(() => {
        expect(screen.queryByRole('link', {
          name: courseAboutMessages.viewAboutPageInStudio.defaultMessage,
        })).not.toBeInTheDocument();
      });
    });
  });
});
