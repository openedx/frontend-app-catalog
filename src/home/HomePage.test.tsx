import { getConfig } from '@edx/frontend-platform';

import {
  render, screen, waitFor, userEvent, within,
} from '@src/setupTest';
import genericMessages from '@src/generic/video-modal/messages';
import courseCardMessages from '@src/generic/course-card/messages';
import { useCourseListSearch } from '@src/data/course-list-search/hooks';
import { mockCourseListSearchResponse } from '@src/__mocks__';
import {
  IFRAME_FEATURE_POLICY, DEFAULT_VIDEO_MODAL_HEIGHT, DATE_FORMAT_OPTIONS,
} from '../constants';
import HomePage from './HomePage';
import messages from './components/home-banner/messages';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    SITE_NAME: process.env.SITE_NAME,
    HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: process.env.HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID,
    ENABLE_COURSE_DISCOVERY: process.env.ENABLE_COURSE_DISCOVERY,
  })),
  ensureConfig: jest.fn(),
}));

jest.mock('@src/data/course-list-search/hooks', () => ({
  useCourseListSearch: jest.fn(),
}));

const mockCourseListSearch = useCourseListSearch as jest.Mock;

describe('HomePage', () => {
  mockCourseListSearch.mockReturnValue({
    data: mockCourseListSearchResponse,
    isLoading: false,
    isError: false,
  });

  it('sets correct document title', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(document.title).toBe(process.env.SITE_NAME);
    });
  });

  it('renders without crashing', () => {
    render(<HomePage />);

    expect(screen.getByText(
      messages.title.defaultMessage.replace('{siteName}', process.env.SITE_NAME),
    )).toBeInTheDocument();
    expect(screen.getByText(messages.subtitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.videoButton.defaultMessage })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage)).toBeInTheDocument();
    expect(screen.getByTestId('home-banner')).toBeInTheDocument();
  });

  it('opens video modal with YouTube iframe when video button is clicked', async () => {
    render(<HomePage />);
    expect(screen.getByTestId('home-banner')).toBeInTheDocument();

    const videoBtn = screen.getByRole('button', { name: messages.videoButton.defaultMessage });
    userEvent.click(videoBtn);

    await waitFor(() => {
      const videoModal = screen.getByRole('dialog');
      expect(videoModal).toBeInTheDocument();
      const iframe = screen.getByTitle(genericMessages.videoIframeTitle.defaultMessage);
      expect(screen.getByLabelText(genericMessages.videoModalTitle.defaultMessage)).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', `//www.youtube.com/embed/${process.env.HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID}?showinfo=0`);
      expect(iframe).toHaveAttribute('allow', IFRAME_FEATURE_POLICY);
      expect(iframe).toHaveAttribute('width', 'auto');
      expect(iframe).toHaveAttribute('height', `${DEFAULT_VIDEO_MODAL_HEIGHT}`);
      expect(iframe).toHaveAttribute('frameborder', '0');
      expect(iframe).toHaveAttribute('allowfullscreen');
    });
  });

  it('should close video modal when Escape key is pressed and return focus to button', async () => {
    render(<HomePage />);

    const videoBtn = screen.getByRole('button', { name: messages.videoButton.defaultMessage });
    userEvent.click(videoBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      const videoButtonAfterClose = screen.getByRole('button', { name: messages.videoButton.defaultMessage });
      expect(videoButtonAfterClose).toBeInTheDocument();
      expect(videoButtonAfterClose).toHaveFocus();
    });
  });

  it('should not pass enableCourseDiscovery to HomeBanner', () => {
    getConfig.mockReturnValue({
      ENABLE_COURSE_DISCOVERY: !process.env.ENABLE_COURSE_DISCOVERY,
    });

    render(<HomePage />);
    expect(screen.getByTestId('home-banner')).toBeInTheDocument();
    expect(screen.queryByRole('search')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(messages.searchPlaceholder.defaultMessage)).not.toBeInTheDocument();
  });

  describe('CoursesList', () => {
    it('renders course cards with correct count', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const courseCards = screen.getAllByRole('link');
      expect(courseCards.length).toBe(mockCourseListSearchResponse.results.length);
    });

    it('renders course cards with correct links', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const courseCards = screen.getAllByRole('link');

      courseCards.forEach((card, index) => {
        const course = mockCourseListSearchResponse.results[index];
        expect(card).toHaveAttribute('href', `/courses/${course.id}/about`);
      });
    });

    it('renders course images with correct URLs and alt text', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const courseCards = screen.getAllByRole('link');

      courseCards.forEach((card, index) => {
        const course = mockCourseListSearchResponse.results[index];
        const cardContent = within(card);

        const courseImage = cardContent.getByAltText(`${course.data.content.displayName} ${course.data.number}`);
        expect(courseImage).toHaveAttribute('src', `${getConfig().LMS_BASE_URL}${course.data.imageUrl}`);
      });
    });

    it('renders course text content correctly', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const courseCards = screen.getAllByRole('link');

      courseCards.forEach((card, index) => {
        const course = mockCourseListSearchResponse.results[index];
        const cardContent = within(card);

        expect(cardContent.getByText(course.data.content.displayName)).toBeInTheDocument();
        expect(cardContent.getByText(course.data.org)).toBeInTheDocument();
        expect(cardContent.getByText(course.data.number)).toBeInTheDocument();
      });
    });

    it('renders course start dates correctly with advertisedStart priority', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const courseCards = screen.getAllByRole('link');

      courseCards.forEach((card, index) => {
        const course = mockCourseListSearchResponse.results[index];
        const cardContent = within(card);

        expect(cardContent.getByText(
          courseCardMessages.startDate.defaultMessage.replace('{startDate}', course.data.advertisedStart),
        )).toBeInTheDocument();
      });
    });

    it('renders formatted start date when advertisedStart is not available', async () => {
      const mockResponseWithoutAdvertisedStart = {
        ...mockCourseListSearchResponse,
        results: mockCourseListSearchResponse.results.map(course => ({
          ...course,
          data: {
            ...course.data,
            advertisedStart: undefined,
          },
        })),
      };

      mockCourseListSearch.mockReturnValueOnce({
        data: mockResponseWithoutAdvertisedStart,
        isLoading: false,
        isError: false,
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const courseCards = screen.getAllByRole('link');

      courseCards.forEach((card, index) => {
        const course = mockResponseWithoutAdvertisedStart.results[index];
        const cardContent = within(card);

        const expectedDate = new Intl.DateTimeFormat(
          'en-US',
          DATE_FORMAT_OPTIONS,
        ).format(new Date(course.data.start));

        expect(cardContent.getByText(
          courseCardMessages.startDate.defaultMessage.replace('{startDate}', expectedDate),
        )).toBeInTheDocument();
      });
    });
  });
});
