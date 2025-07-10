import { getConfig } from '@edx/frontend-platform';

import messages from './components/home-banner/messages';
import {
  render, cleanup, screen, userEvent, waitFor,
} from '../setupTest';
import { mockFrontendParamsResponse } from '../__mocks__';
import { IFRAME_FEATURE_POLICY, DEFAULT_VIDEO_MODAL_HEIGHT } from '../constants';
import HomePage from './HomePage';

jest.mock('../data/frontend-params/hooks', () => ({
  useFrontendParamsQuery: jest.fn(),
}));

const mockUseFrontendParamsQuery = require('../data/frontend-params/hooks').useFrontendParamsQuery;

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('<HomePage />', () => {
  describe('Loading state', () => {
    it('should show loading status when data is loading', () => {
      mockUseFrontendParamsQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
      });

      render(<HomePage />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Success state with data', () => {
    it('should render the HomeBanner with the correct props', () => {
      mockUseFrontendParamsQuery.mockReturnValue({
        data: mockFrontendParamsResponse,
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<HomePage />);
      waitFor(() => {
        expect(screen.getByTestId('home-banner')).toBeInTheDocument();
        expect(screen.getByText(messages.title.defaultMessage.replace('{siteName}', getConfig().SITE_NAME))).toBeInTheDocument();
        expect(screen.getByText(messages.subtitle.defaultMessage)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: messages.videoButton.defaultMessage })).toBeInTheDocument();
        expect(screen.getByRole('search')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage)).toBeInTheDocument();
      });
    });

    it('should pass homepageOverlayHtml to HomeBanner', () => {
      const testData = {
        ...mockFrontendParamsResponse,
        homepageOverlayHtml: '<div>Test overlay</div>',
      };

      mockUseFrontendParamsQuery.mockReturnValue({
        data: testData,
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<HomePage />);
      waitFor(() => {
        expect(screen.getByTestId('home-banner')).toBeInTheDocument();
        expect(screen.getByText('Test overlay')).toBeInTheDocument();
      });
    });

    it('should pass an empty string when homepageOverlayHtml = null', () => {
      const testData = {
        ...mockFrontendParamsResponse,
        homepageOverlayHtml: null,
      };

      mockUseFrontendParamsQuery.mockReturnValue({
        data: testData,
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<HomePage />);
      waitFor(() => {
        expect(screen.getByTestId('home-banner')).toBeInTheDocument();
        expect(screen.queryByText('Test overlay')).not.toBeInTheDocument();
      });
    });

    it('should pass showHomepagePromoVideo and homepagePromoVideoYoutubeId to HomeBanner and open the video modal', () => {
      Object.defineProperty(window, 'focus', {
        value: jest.fn(),
        writable: true,
      });

      const testData = {
        ...mockFrontendParamsResponse,
        homepagePromoVideoYoutubeId: 'test-youtube-id',
        showHomepagePromoVideo: true,
      };

      mockUseFrontendParamsQuery.mockReturnValue({
        data: testData,
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<HomePage />);
      waitFor(() => {
        expect(screen.getByTestId('home-banner')).toBeInTheDocument();
      });

      waitFor(() => {
        const videoBtn = screen.getByRole('button', { name: messages.videoButton.defaultMessage });
        userEvent.click(videoBtn);
      });

      waitFor(() => {
        const videoModal = screen.getByRole('dialog');
        expect(videoModal).toBeInTheDocument();
        const iframe = screen.getByTitle('YouTube Video title');
        expect(iframe).toHaveAttribute('src', `//www.youtube.com/embed/${testData.homepagePromoVideoYoutubeId}?showinfo=0`);
        expect(iframe).toHaveAttribute('allow', IFRAME_FEATURE_POLICY);
        expect(iframe).toHaveAttribute('width', 'auto');
        expect(iframe).toHaveAttribute('height', `${DEFAULT_VIDEO_MODAL_HEIGHT}`);
        expect(iframe).toHaveAttribute('frameborder', '0');
        expect(iframe).toHaveAttribute('allowfullscreen');
      });
    });

    it('should close video modal when Escape key is pressed and return focus to button', () => {
      const testData = {
        ...mockFrontendParamsResponse,
        homepagePromoVideoYoutubeId: 'test-youtube-id',
        showHomepagePromoVideo: true,
      };

      mockUseFrontendParamsQuery.mockReturnValue({
        data: testData,
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<HomePage />);

      waitFor(() => {
        const videoBtn = screen.getByRole('button', { name: messages.videoButton.defaultMessage });
        userEvent.click(videoBtn);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      userEvent.keyboard('{Escape}');

      waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        const videoButtonAfterClose = screen.getByRole('button', { name: messages.videoButton.defaultMessage });
        expect(videoButtonAfterClose).toBeInTheDocument();
        expect(videoButtonAfterClose).toHaveFocus();
      });
    });

    it('should not pass enableCourseDiscovery to HomeBanner', () => {
      const testData = {
        ...mockFrontendParamsResponse,
        enableCourseDiscovery: false,
      };

      mockUseFrontendParamsQuery.mockReturnValue({
        data: testData,
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<HomePage />);
      waitFor(() => {
        expect(screen.getByTestId('home-banner')).toBeInTheDocument();
        expect(screen.queryByRole('search')).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText(messages.searchPlaceholder.defaultMessage)).not.toBeInTheDocument();
      });
    });
  });

  describe('Real context integration', () => {
    it('should handle undefined data from context', () => {
      mockUseFrontendParamsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<HomePage />);
      waitFor(() => {
        expect(screen.getByTestId('home-banner')).toBeInTheDocument();
      });
    });

    it('should handle empty object data from context', () => {
      mockUseFrontendParamsQuery.mockReturnValue({
        data: {},
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<HomePage />);
      waitFor(() => {
        expect(screen.getByTestId('home-banner')).toBeInTheDocument();
      });
    });

    it('should handle partial data from context', () => {
      const partialData = {
        homepageOverlayHtml: '<div>Partial data</div>',
        showHomepagePromoVideo: true,
      };

      mockUseFrontendParamsQuery.mockReturnValue({
        data: partialData,
        isLoading: false,
        error: null,
        isError: false,
      });

      render(<HomePage />);
      waitFor(() => {
        expect(screen.getByTestId('home-banner')).toBeInTheDocument();
        expect(screen.getByText('Partial data')).toBeInTheDocument();
      });
    });
  });
});
