import { ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { cleanup, renderHook } from '../../setupTest';

import { ROUTES } from '../../routes';
import { useMenuItems } from './useMenuItems';
import messages from '../messages';

const DEFAULT_CONFIG = {
  LMS_BASE_URL: process.env.LMS_BASE_URL,
  SUPPORT_URL: process.env.SUPPORT_URL,
  ENABLE_PROGRAMS: true,
  ENABLE_COURSE_DISCOVERY: true,
  COURSES_ARE_BROWSABLE: true,
};

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => DEFAULT_CONFIG),
  ensureConfig: jest.fn(),
  mergeConfig: jest.fn(),
  setConfig: jest.fn(),
}));

const createWrapper = (authenticatedUser: {
  username: string } | null) => function Wrapper({ children }: { children: ReactNode }) {
  const contextValue = useMemo(() => ({ authenticatedUser }), [authenticatedUser]);

  return (
    <AppContext.Provider value={contextValue}>
      <IntlProvider locale="en">
        {children}
      </IntlProvider>
    </AppContext.Provider>
  );
};

describe('useMenuItems', () => {
  const mockLocation = {
    pathname: '/',
  };

  beforeEach(() => {
    (useLocation as jest.Mock).mockReturnValue(mockLocation);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('should return correct menu items for non-authenticated user', () => {
    const { result } = renderHook(() => useMenuItems(), { wrapper: createWrapper(null) });

    expect(result.current.mainMenu).toHaveLength(1);
    expect(result.current.mainMenu[0]).toEqual({
      type: 'item',
      href: `${getConfig().LMS_BASE_URL}${ROUTES.COURSES}`,
      content: messages.exploreCourses.defaultMessage,
      isActive: false,
    });
  });

  it('should return correct menu items for authenticated user', () => {
    const { result } = renderHook(() => useMenuItems(), { wrapper: createWrapper({ username: 'testuser' }) });

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

    const { result } = renderHook(() => useMenuItems(), { wrapper: createWrapper({ username: 'testuser' }) });

    expect(result.current.mainMenu).toHaveLength(2);
    expect(result.current.mainMenu.some(item => item.content === messages.programs.defaultMessage)).toBe(false);
  });

  it('should not include course discovery menu item when ENABLE_COURSE_DISCOVERY is false', () => {
    (getConfig as jest.Mock).mockReturnValue({
      ...DEFAULT_CONFIG,
      ENABLE_PROGRAMS: false,
      ENABLE_COURSE_DISCOVERY: false,
    });

    const { result } = renderHook(() => useMenuItems(), { wrapper: createWrapper(null) });

    expect(result.current.mainMenu).toHaveLength(0);
  });

  it('should set isActive to true when on course catalog page', () => {
    (getConfig as jest.Mock).mockReturnValue(DEFAULT_CONFIG);

    (useLocation as jest.Mock).mockReturnValue({
      pathname: ROUTES.COURSES,
    });

    const { result } = renderHook(() => useMenuItems(), { wrapper: createWrapper(null) });

    expect(result.current.mainMenu[0].isActive).toBe(true);
  });

  it('should include help link in secondary menu when SUPPORT_URL is configured', () => {
    const { result } = renderHook(() => useMenuItems(), { wrapper: createWrapper(null) });

    expect(result.current.secondaryMenu).toHaveLength(1);
    expect(result.current.secondaryMenu[0]).toEqual({
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

    const { result } = renderHook(() => useMenuItems(), { wrapper: createWrapper(null) });

    expect(result.current.secondaryMenu).toHaveLength(0);
  });

  it('should set isNotHomePage to true when on course catalog page', () => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: ROUTES.COURSES,
    });

    const { result } = renderHook(() => useMenuItems(), { wrapper: createWrapper(null) });

    expect(result.current.isNotHomePage).toBe(true);
  });

  it('should set isNotHomePage to true when on course about page', () => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: `${ROUTES.COURSE_ABOUT}/some-course`,
    });

    const { result } = renderHook(() => useMenuItems(), { wrapper: createWrapper(null) });

    expect(result.current.isNotHomePage).toBe(true);
  });
});
