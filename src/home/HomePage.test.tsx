import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { getAppConfig, getSiteConfig, IntlProvider } from '@openedx/frontend-base';

import { appId, DATE_FORMAT_OPTIONS } from '@src/constants';
import genericMessages from '@src/generic/video-modal/messages';
import courseCardMessages from '@src/generic/course-card/messages';
import { useCatalogSearch } from '@src/data/catalog-search/hooks';
import { mockCatalogSearchResponse } from '@src/__mocks__';
import type { CatalogSearchResult } from '@src/data/catalog-search/types';
import {
  DEFAULT_VIDEO_MODAL_HEIGHT, IFRAME_FEATURE_POLICY,
} from '../constants';
import ActualHomePage from './HomePage';
import homePageMessages from './messages';
import messages from './components/home-banner/messages';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAppConfig: jest.fn(),
  getUrlByRouteRole: jest.fn(() => '/courses/:courseId/about'),
  resolveRouteByRole: jest.fn((role: string, params: { courseId?: string; pathwayId?: string }) => (
    role === 'org.openedx.frontend.role.pathwayDetail'
      ? { url: `/catalog/pathways/${params.pathwayId}`, isInternal: true }
      : { url: `/courses/${params.courseId}/about`, isInternal: true }
  )),
}));

jest.mock('@src/data/catalog-search/hooks', () => ({
  useCatalogSearch: jest.fn(),
}));

const { getAppConfig: actualGetAppConfig } = jest.requireActual('@openedx/frontend-base');
const mockedGetAppConfig = getAppConfig as jest.Mock;
const mockCatalogSearch = useCatalogSearch as jest.Mock;

/**
 * The search response can mix courses and pathways; narrow to the course arm
 * before reading course-only fields off `data`.
 */
const isCourseResult = (
  result: CatalogSearchResult,
): result is CatalogSearchResult & { type: 'course' | '_doc' } => result.type !== 'pathway';

/**
 * The search response can mix courses and pathways; narrow to the pathway arm
 * before reading pathway-only fields off `data`.
 */
const isPathwayResult = (
  result: CatalogSearchResult,
): result is CatalogSearchResult & { type: 'pathway' } => result.type === 'pathway';

const courseResults = mockCatalogSearchResponse.results.filter(isCourseResult);
const pathwayResults = mockCatalogSearchResponse.results.filter(isPathwayResult);

const formatDateForTest = (dateString: string) => new Intl.DateTimeFormat(
  'en-US',
  DATE_FORMAT_OPTIONS,
).format(new Date(dateString));

const HomePage = () => (
  <IntlProvider locale="en"><MemoryRouter><ActualHomePage /></MemoryRouter></IntlProvider>
);

beforeEach(() => {
  mockedGetAppConfig.mockImplementation(actualGetAppConfig);
  mockCatalogSearch.mockReturnValue({
    data: mockCatalogSearchResponse,
    isLoading: false,
    isError: false,
  });
});

describe('HomePage', () => {
  it('sets correct document title', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(document.title).toBe(
        homePageMessages.pageTitle.defaultMessage.replace('{siteName}', getSiteConfig().siteName),
      );
    });
  });

  it('renders without crashing', () => {
    render(<HomePage />);

    expect(screen.getByText(
      messages.title.defaultMessage.replace('{siteName}', getSiteConfig().siteName),
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
      expect(iframe).toHaveAttribute('src', `//www.youtube.com/embed/${getAppConfig(appId).HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID}?showinfo=0`);
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
    mockedGetAppConfig.mockReturnValue({
      ...actualGetAppConfig(appId),
      ENABLE_COURSE_DISCOVERY: false,
    });

    render(<HomePage />);
    expect(screen.getByTestId('home-banner')).toBeInTheDocument();
    expect(screen.queryByRole('search')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(messages.searchPlaceholder.defaultMessage)).not.toBeInTheDocument();
  });

  describe('CoursesList', () => {
    it('renders cards with correct count', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const cards = screen.getAllByRole('link');
      expect(cards.length).toBe(mockCatalogSearchResponse.results.length);
    });

    it('renders course cards with correct links', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const cards = screen.getAllByRole('link');

      cards.forEach((card, index) => {
        const item = mockCatalogSearchResponse.results[index];
        if (item.type === 'pathway') {
          expect(card).toHaveAttribute('href', `/catalog/pathways/${item.id}`);
        } else {
          expect(card).toHaveAttribute('href', `/courses/${item.id}/about`);
        }
      });
    });

    it('renders course images with correct URLs and alt text', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const cards = screen.getAllByRole('link');

      cards.forEach((card, index) => {
        const item = mockCatalogSearchResponse.results[index];
        const cardContent = within(card);

        let image;
        if (item.type === 'pathway') {
          image = cardContent.getByAltText(item.data.content.displayName);
        } else {
          image = cardContent.getByAltText(`${item.data.content.displayName} ${item.data.number}`);
        }

        expect(image).toHaveAttribute('src', `${getSiteConfig().lmsBaseUrl}${item.data.imageUrl}`);
      });
    });

    it('renders course text content correctly', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const courseCards = screen.getAllByTestId('course-card');

      courseCards.forEach((card, index) => {
        const course = courseResults[index];
        const cardContent = within(card);

        expect(cardContent.getByText(course.data.content.displayName)).toBeInTheDocument();
        expect(cardContent.getByText(course.data.org)).toBeInTheDocument();
        expect(cardContent.getByText(course.data.number)).toBeInTheDocument();
      });
    });

    it('renders pathway cards content correctly', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const pathwayCards = screen.getAllByTestId('pathway-card');

      pathwayCards.forEach((card, index) => {
        const pathway = pathwayResults[index];
        const cardContent = within(card);

        expect(cardContent.getByText(pathway.data.content.displayName)).toBeInTheDocument();
        expect(cardContent.getByText(pathway.data.org)).toBeInTheDocument();
        expect(cardContent.getByText(`${pathway.data.itemCount} Courses`)).toBeInTheDocument();
      });
    });

    it('renders course start dates correctly with advertisedStart priority', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const courseCards = screen.getAllByTestId('course-card');

      courseCards.forEach((card, index) => {
        const course = courseResults[index];
        const cardContent = within(card);

        expect(cardContent.getByText(
          courseCardMessages.startDate.defaultMessage.replace('{startDate}', course.data.advertisedStart ?? ''),
        )).toBeInTheDocument();
      });
    });

    it('renders formatted start date when advertisedStart is not available', async () => {
      const mockResponseWithoutAdvertisedStart = {
        ...mockCatalogSearchResponse,
        results: courseResults.map(course => ({
          ...course,
          data: {
            ...course.data,
            advertisedStart: undefined,
          },
        })),
      };

      mockCatalogSearch.mockReturnValueOnce({
        data: mockResponseWithoutAdvertisedStart,
        isLoading: false,
        isError: false,
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const courseCards = screen.getAllByTestId('course-card');

      courseCards.forEach((card, index) => {
        const course = mockResponseWithoutAdvertisedStart.results[index];
        const cardContent = within(card);

        const expectedDate = formatDateForTest(course.data.start);

        expect(cardContent.getByText(
          courseCardMessages.startDate.defaultMessage.replace('{startDate}', expectedDate),
        )).toBeInTheDocument();
      });
    });
  });
});
