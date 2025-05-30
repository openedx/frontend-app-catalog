import * as reactRouter from 'react-router';
import { getConfig as mockGetConfig } from '@edx/frontend-platform';

import { ROUTES } from '../../../routes';
import { render, userEvent, cleanup } from '../../../setupTest';
import HomeBanner from './HomeBanner';

import messages from './messages';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    HOMEPAGE_OVERLAY_HTML: '',
    SITE_NAME: 'My Site',
    ENABLE_COURSE_DISCOVERY: true,
    HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: 'dQw4w9WgXcQ',
  })),
  ensureConfig: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('<HomeBanner />', () => {
  it('renders title and subtitle', () => {
    const { getByText } = render(<HomeBanner />);

    expect(getByText('Welcome to My Site')).toBeInTheDocument();
    expect(getByText(messages.subtitle.defaultMessage)).toBeInTheDocument();
  });

  it('renders home overlay html', () => {
    mockGetConfig.mockReturnValueOnce({
      HOMEPAGE_OVERLAY_HTML: '<div>HOMEPAGE OVERLAY HTML</div>',
    });

    const { getByText, queryByText } = render(<HomeBanner />);

    expect(getByText('HOMEPAGE OVERLAY HTML')).toBeInTheDocument();
    expect(queryByText('Welcome to My Site')).not.toBeInTheDocument();
    expect(queryByText(messages.subtitle.defaultMessage)).not.toBeInTheDocument();
  });

  it('renders search input and triggers navigate on button click', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(reactRouter, 'useNavigate').mockReturnValue(mockNavigate);

    const { getByPlaceholderText, getByRole } = render(<HomeBanner />);
    const input = getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await userEvent.type(input, 'some_text');

    const button = getByRole('button', { name: messages.videoButtonAlt.defaultMessage });
    await userEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(`${ROUTES.COURSES}?search_query=some_text`);
  });

  it('triggers navigate on Enter key press', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(reactRouter, 'useNavigate').mockReturnValue(mockNavigate);

    const { getByPlaceholderText } = render(<HomeBanner />);
    const input = getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await userEvent.type(input, 'some_text{enter}');

    expect(mockNavigate).toHaveBeenCalledWith(`${ROUTES.COURSES}?search_query=some_text`);
  });

  it('opens video modal', async () => {
    const { getByText, getByTitle } = render(<HomeBanner />);

    const openButton = getByText(messages.videoButton.defaultMessage);
    await userEvent.click(openButton);

    expect(getByTitle(messages.videoIframeTitle.defaultMessage)).toBeInTheDocument();
  });
});
