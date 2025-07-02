import * as reactRouter from 'react-router';

import { ROUTES } from '../../../routes';
import { render, userEvent, cleanup } from '../../../setupTest';
import { mockHomeSettingsResponse } from '../../__mocks__';
import HomeBanner from './HomeBanner';
import messages from './messages';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    SITE_NAME: 'My Site',
  })),
  ensureConfig: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('<HomeBanner />', () => {
  it('renders title and subtitle', () => {
    const { getByText } = render(<HomeBanner {...mockHomeSettingsResponse} />);

    expect(getByText(messages.title.defaultMessage.replace('{siteName}', 'My Site'))).toBeInTheDocument();
    expect(getByText(messages.subtitle.defaultMessage)).toBeInTheDocument();
  });

  it('renders homepageOverlayHtml as dangerouslySetInnerHTML', () => {
    const html = '<div id="custom-heading">Custom HTML</div>';
    const props = { homepageOverlayHtml: html, showHomepagePromoVideo: false };

    const { container } = render(<HomeBanner {...props} />);
    const element = container.querySelector('#custom-heading');
    expect(element).toBeInTheDocument();
    expect(element?.textContent).toBe('Custom HTML');
  });

  it('renders search input and triggers navigate on button click', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(reactRouter, 'useNavigate').mockReturnValue(mockNavigate);

    const { getByPlaceholderText, getByRole } = render(<HomeBanner {...mockHomeSettingsResponse} />);
    const input = getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await userEvent.type(input, 'some_text');

    const button = getByRole('button', { name: messages.videoButtonAlt.defaultMessage });
    await userEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(`${ROUTES.COURSES}?search_query=some_text`);
  });

  it('triggers navigate on Enter key press', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(reactRouter, 'useNavigate').mockReturnValue(mockNavigate);

    const { getByPlaceholderText } = render(<HomeBanner {...mockHomeSettingsResponse} />);
    const input = getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await userEvent.type(input, 'some_text{enter}');

    expect(mockNavigate).toHaveBeenCalledWith(`${ROUTES.COURSES}?search_query=some_text`);
  });

  it('opens video modal', async () => {
    const { getByText, getByTitle } = render(<HomeBanner {...mockHomeSettingsResponse} />);

    const openButton = getByText(messages.videoButton.defaultMessage);
    await userEvent.click(openButton);

    expect(getByTitle(messages.videoIframeTitle.defaultMessage)).toBeInTheDocument();
  });

  it('does not render search input if enableCourseDiscovery is false', () => {
    const props = { enableCourseDiscovery: false };

    const { queryByPlaceholderText } = render(<HomeBanner {...props} />);
    expect(queryByPlaceholderText(messages.searchPlaceholder.defaultMessage)).not.toBeInTheDocument();
  });
});
