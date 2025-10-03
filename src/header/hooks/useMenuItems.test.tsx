import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { cleanup, renderHook } from '@src/setupTest';
import { ROUTES } from '@src/routes';
import { AuthenticatedUserTypes } from '../types';
import messages from '../messages';
import { useMenuItems } from './useMenuItems';

const DEFAULT_CONFIG = {
  LMS_BASE_URL: process.env.LMS_BASE_URL,
  SUPPORT_URL: process.env.SUPPORT_URL,
  ENABLE_PROGRAMS: process.env.ENABLE_PROGRAMS,
  ENABLE_COURSE_DISCOVERY: process.env.ENABLE_COURSE_DISCOVERY,
};

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => DEFAULT_CONFIG),
}));

const renderWithAppContext = (authenticatedUser: Pick<AuthenticatedUserTypes, 'username'> | null) => {
  const contextValue = { authenticatedUser };

  return renderHook(() => useMenuItems(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <AppContext.Provider value={contextValue}>
        <IntlProvider locale="en">
          {children}
        </IntlProvider>
      </AppContext.Provider>
    ),
  });
};

describe('useMenuItems', () => {
  const mockLocation = {
    pathname: ROUTES.HOME,
  };

  beforeEach(() => {
    (useLocation as jest.Mock).mockReturnValue(mockLocation);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('should return correct menu items for non-authenticated user', () => {
    const { result } = renderWithAppContext(null);

    expect(result.current.mainMenu).toHaveLength(1);
    expect(result.current.mainMenu[0]).toEqual({
      type: 'item',
      href: `${getConfig().LMS_BASE_URL}${ROUTES.COURSES}`,
      content: messages.exploreCourses.defaultMessage,
      isActive: false,
    });
  });

  it('should return correct menu items for authenticated user', () => {
    const { result } = renderWithAppContext({ username: 'testuser' });

    expect(result.current.mainMenu).toHaveLength(3);
    expect(result.current.mainMenu[0]).toEqual({
      type: 'item',
      href: `${getConfig().LMS_BASE_URL}/dashboard`,
      content: messages.courses.defaultMessage,
    });
    expect(result.current.mainMenu[1]).toEqual({
      type: 'item',
      href: expect.stringContaining('/programs'),
      content: messages.programs.defaultMessage,
    });
    expect(result.current.mainMenu[2]).toEqual({
      type: 'item',
      href: `${getConfig().LMS_BASE_URL}${ROUTES.COURSES}`,
      content: messages.discoverNew.defaultMessage,
      isActive: false,
    });
  });

  it('should not include programs menu item when ENABLE_PROGRAMS is false', () => {
    (getConfig as jest.Mock).mockReturnValue({
      ...DEFAULT_CONFIG,
      ENABLE_PROGRAMS: false,
    });

    const { result } = renderWithAppContext({ username: 'testuser' });

    expect(result.current.mainMenu).toHaveLength(2);
    expect(result.current.mainMenu.some(item => item.content === messages.programs.defaultMessage)).toBe(false);
  });

  it('should not include course discovery menu item when ENABLE_COURSE_DISCOVERY is false', () => {
    (getConfig as jest.Mock).mockReturnValue({
      ...DEFAULT_CONFIG,
      ENABLE_PROGRAMS: false,
      ENABLE_COURSE_DISCOVERY: false,
    });

    const { result } = renderWithAppContext(null);

    expect(result.current.mainMenu).not.toContainEqual(
      expect.objectContaining({
        type: 'item',
        content: messages.discoverNew.defaultMessage,
      }),
    );
  });

  it('should set isActive to true when navigated to the corresponding route', () => {
    (getConfig as jest.Mock).mockReturnValue(DEFAULT_CONFIG);

    (useLocation as jest.Mock).mockReturnValue({
      pathname: ROUTES.COURSES,
    });

    const { result } = renderWithAppContext(null);

    expect(result.current.mainMenu[0].isActive).toBe(true);
  });

  it('should include help link in secondary menu when SUPPORT_URL is configured', () => {
    const { result } = renderWithAppContext(null);

    expect(result.current.secondaryMenu).toHaveLength(1);
    expect(result.current.secondaryMenu).toContainEqual({
      type: 'item',
      href: getConfig().SUPPORT_URL,
      content: messages.help.defaultMessage,
    });
  });

  it('should not include help link in secondary menu when SUPPORT_URL is not configured', () => {
    (getConfig as jest.Mock).mockReturnValue({
      ...DEFAULT_CONFIG,
      SUPPORT_URL: undefined,
      ENABLE_PROGRAMS: false,
      ENABLE_COURSE_DISCOVERY: false,
    });

    const { result } = renderWithAppContext(null);

    expect(result.current.secondaryMenu).not.toContainEqual(
      expect.objectContaining({
        type: 'item',
        content: messages.help.defaultMessage,
      }),
    );
  });
});
