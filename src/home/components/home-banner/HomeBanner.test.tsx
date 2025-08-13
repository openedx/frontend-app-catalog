import * as reactRouter from 'react-router';

import { ROUTES } from '@src/routes';
import {
  render, userEvent, cleanup, screen,
} from '@src/setupTest';
import HomeBanner from './HomeBanner';

import messages from './messages';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    ENABLE_COURSE_DISCOVERY: process.env.ENABLE_COURSE_DISCOVERY,
  })),
  ensureConfig: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('<HomeBanner />', () => {
  it('renders search input and triggers navigate on Enter key press', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(reactRouter, 'useNavigate').mockReturnValue(mockNavigate);

    render(<HomeBanner />);
    const input = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    await userEvent.type(input, 'some_text{enter}');

    expect(mockNavigate).toHaveBeenCalledWith(`${ROUTES.COURSES}?search_query=some_text`);
  });

  it('triggers navigate on Enter key press', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(reactRouter, 'useNavigate').mockReturnValue(mockNavigate);

    render(<HomeBanner />);
    const input = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await userEvent.type(input, 'some_text{enter}');

    expect(mockNavigate).toHaveBeenCalledWith(`${ROUTES.COURSES}?search_query=some_text`);
  });
});
