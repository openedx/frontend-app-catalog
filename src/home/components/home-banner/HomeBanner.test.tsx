import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@openedx/frontend-base';
import { useNavigate } from 'react-router';

import HomeBanner from './HomeBanner';
import messages from './messages';

const COURSES_URL = '/catalog/courses';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getUrlByRouteRole: jest.fn(() => COURSES_URL),
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: jest.fn(),
}));

const mockedUseNavigate = useNavigate as jest.Mock;

const renderHomeBanner = () => render(
  <IntlProvider locale="en"><HomeBanner /></IntlProvider>,
);

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('<HomeBanner />', () => {
  it('renders search input and triggers navigate on Enter key press', async () => {
    const mockNavigate = jest.fn();
    mockedUseNavigate.mockReturnValue(mockNavigate);

    renderHomeBanner();
    const input = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);

    await userEvent.type(input, 'some_text{enter}');

    expect(mockNavigate).toHaveBeenCalledWith(`${COURSES_URL}?search_query=some_text`);
  });

  it('triggers navigate on Enter key press', async () => {
    const mockNavigate = jest.fn();
    mockedUseNavigate.mockReturnValue(mockNavigate);

    renderHomeBanner();
    const input = screen.getByPlaceholderText(messages.searchPlaceholder.defaultMessage);
    await userEvent.type(input, 'some_text{enter}');

    expect(mockNavigate).toHaveBeenCalledWith(`${COURSES_URL}?search_query=some_text`);
  });
});
