import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';

import { render } from '../setupTest';
import { ROUTES } from '../routes';
import CatalogHeader from './CatalogHeader';
import { useMenuItems } from './hooks/useMenuItems';
import messages from './messages';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    LMS_BASE_URL: process.env.LMS_BASE_URL,
    ENABLE_PROGRAMS: true,
    ENABLE_COURSE_DISCOVERY: true,
  })),
  ensureConfig: jest.fn(),
  mergeConfig: jest.fn(),
}));

jest.mock('@edx/frontend-component-header', () => ({
  __esModule: true,
  default: jest.fn(({ mainMenuItems, logoDestination, secondaryMenuItems }) => (
    <div data-testid="header">
      <div data-testid="main-menu">{JSON.stringify(mainMenuItems)}</div>
      <div data-testid="logo-destination">{logoDestination}</div>
      <div data-testid="secondary-menu">{JSON.stringify(secondaryMenuItems)}</div>
    </div>
  )),
}));

jest.mock('./hooks/useMenuItems', () => ({
  useMenuItems: jest.fn(),
}));

describe('CatalogHeader', () => {
  const mockMenuItems = {
    mainMenu: [
      {
        type: 'item',
        href: `${getConfig().LMS_BASE_URL}/dashboard`,
        content: messages.courses.defaultMessage,
      },
    ],
    secondaryMenu: [
      {
        type: 'item',
        href: getConfig().SUPPORT_URL,
        content: messages.help.defaultMessage,
      },
    ],
    isNotHomePage: false,
  };

  beforeEach(() => {
    (useMenuItems as jest.Mock).mockReturnValue(mockMenuItems);
  });

  afterEach(() => jest.clearAllMocks());

  it('renders header with correct props', () => {
    const { getByTestId } = render(<CatalogHeader />);

    expect(getByTestId('header')).toBeInTheDocument();
    expect(getByTestId('main-menu')).toHaveTextContent(JSON.stringify(mockMenuItems.mainMenu));
    expect(getByTestId('secondary-menu')).toHaveTextContent(JSON.stringify(mockMenuItems.secondaryMenu));
    expect(getByTestId('logo-destination')).toHaveTextContent(getConfig().LMS_BASE_URL);
  });

  it('should display Help link if SUPPORT_URL is set', () => {
    mergeConfig({ SUPPORT_URL: getConfig().SUPPORT_URL });
    const { getByTestId } = render(<CatalogHeader />);
    const secondaryMenuText = getByTestId('secondary-menu').textContent;
    const secondaryMenu = secondaryMenuText ? JSON.parse(secondaryMenuText) : [];

    expect(secondaryMenu).toHaveLength(1);
    expect(secondaryMenu[0].href).toBe(getConfig().SUPPORT_URL);
  });

  it('should display Programs link if it is enabled by configuration', () => {
    const mockMenuItemsWithPrograms = {
      ...mockMenuItems,
      mainMenu: [
        ...mockMenuItems.mainMenu,
        {
          type: 'item',
          href: `${getConfig().LMS_BASE_URL}/programs`,
          content: messages.programs.defaultMessage,
        },
      ],
    };
    (useMenuItems as jest.Mock).mockReturnValue(mockMenuItemsWithPrograms);

    const { getByTestId } = render(<CatalogHeader />);
    const mainMenuText = getByTestId('main-menu').textContent;
    const mainMenu = mainMenuText ? JSON.parse(mainMenuText) : [];

    expect(mainMenu).toContainEqual(
      expect.objectContaining({
        href: expect.stringContaining('/programs'),
      }),
    );
  });

  it('should not display Discover New tab if course discovery is disabled', () => {
    const mockMenuItemsWithoutDiscovery = {
      ...mockMenuItems,
      mainMenu: mockMenuItems.mainMenu.filter(item => !item.href.includes(ROUTES.COURSES)),
    };
    (useMenuItems as jest.Mock).mockReturnValue(mockMenuItemsWithoutDiscovery);

    const { getByTestId } = render(<CatalogHeader />);
    const mainMenuText = getByTestId('main-menu').textContent;
    const mainMenu = mainMenuText ? JSON.parse(mainMenuText) : [];

    expect(mainMenu).not.toContainEqual(
      expect.objectContaining({
        href: expect.stringContaining(ROUTES.COURSES),
      }),
    );
  });

  it('should not display Help link if SUPPORT_URL is not set', () => {
    mergeConfig({ SUPPORT_URL: undefined });
    const mockMenuItemsWithoutHelp = {
      ...mockMenuItems,
      secondaryMenu: [],
    };
    (useMenuItems as jest.Mock).mockReturnValue(mockMenuItemsWithoutHelp);

    const { getByTestId } = render(<CatalogHeader />);
    const secondaryMenuText = getByTestId('secondary-menu').textContent;
    const secondaryMenu = secondaryMenuText ? JSON.parse(secondaryMenuText) : [];

    expect(secondaryMenu).toHaveLength(0);
  });

  it('should display active state for current page menu item', () => {
    const mockMenuItemsWithActive = {
      ...mockMenuItems,
      mainMenu: [
        {
          type: 'item',
          href: `${getConfig().LMS_BASE_URL}/dashboard`,
          content: messages.courses.defaultMessage,
          isActive: true,
        },
      ],
    };
    (useMenuItems as jest.Mock).mockReturnValue(mockMenuItemsWithActive);

    const { getByTestId } = render(<CatalogHeader />);
    const mainMenuText = getByTestId('main-menu').textContent;
    const mainMenu = mainMenuText ? JSON.parse(mainMenuText) : [];

    expect(mainMenu[0].isActive).toBe(true);
  });

  it('should handle empty menu items gracefully', () => {
    const mockEmptyMenuItems = {
      mainMenu: [],
      secondaryMenu: [],
      isNotHomePage: false,
    };
    (useMenuItems as jest.Mock).mockReturnValue(mockEmptyMenuItems);

    const { getByTestId } = render(<CatalogHeader />);
    const mainMenuText = getByTestId('main-menu').textContent;
    const secondaryMenuText = getByTestId('secondary-menu').textContent;
    const mainMenu = mainMenuText ? JSON.parse(mainMenuText) : [];
    const secondaryMenu = secondaryMenuText ? JSON.parse(secondaryMenuText) : [];

    expect(mainMenu).toHaveLength(0);
    expect(secondaryMenu).toHaveLength(0);
  });

  it('should display Explore courses link when course discovery is enabled', () => {
    const mockMenuItemsWithExploreCourses = {
      ...mockMenuItems,
      mainMenu: [
        ...mockMenuItems.mainMenu,
        {
          type: 'item',
          href: `${getConfig().LMS_BASE_URL}${ROUTES.COURSES}`,
          content: messages.exploreCourses.defaultMessage,
          isActive: false,
        },
      ],
    };
    (useMenuItems as jest.Mock).mockReturnValue(mockMenuItemsWithExploreCourses);
    mergeConfig({ ENABLE_COURSE_DISCOVERY: true });

    const { getByTestId } = render(<CatalogHeader />);
    const mainMenuText = getByTestId('main-menu').textContent;
    const mainMenu = mainMenuText ? JSON.parse(mainMenuText) : [];

    expect(mainMenu).toContainEqual(
      expect.objectContaining({
        href: expect.stringContaining(ROUTES.COURSES),
        content: messages.exploreCourses.defaultMessage,
      }),
    );
  });

  it('should display correct menu items for authenticated user', () => {
    const authenticatedUser = { username: 'testuser' };
    const mockMenuItemsForAuth = {
      mainMenu: [
        {
          type: 'item',
          href: `${getConfig().LMS_BASE_URL}/dashboard`,
          content: messages.courses.defaultMessage,
        },
        {
          type: 'item',
          href: `${getConfig().LMS_BASE_URL}/programs`,
          content: messages.programs.defaultMessage,
        },
        {
          type: 'item',
          href: `${getConfig().LMS_BASE_URL}${ROUTES.COURSES}`,
          content: messages.discoverNew.defaultMessage,
        },
      ],
      secondaryMenu: [
        {
          type: 'item',
          href: getConfig().SUPPORT_URL,
          content: messages.help.defaultMessage,
        },
      ],
      isNotHomePage: false,
    };
    (useMenuItems as jest.Mock).mockReturnValue(mockMenuItemsForAuth);

    const { getByTestId } = render(
      <AppContext.Provider value={{ authenticatedUser }}>
        <CatalogHeader />
      </AppContext.Provider>,
    );

    const mainMenuText = getByTestId('main-menu').textContent;
    const mainMenu = mainMenuText ? JSON.parse(mainMenuText) : [];

    expect(mainMenu).toHaveLength(3);
    expect(mainMenu[0].href).toBe(`${getConfig().LMS_BASE_URL}/dashboard`);
    expect(mainMenu[1].href).toBe(`${getConfig().LMS_BASE_URL}/programs`);
    expect(mainMenu[2].href).toBe(`${getConfig().LMS_BASE_URL}${ROUTES.COURSES}`);
  });

  it('should display correct menu items for non-authenticated user', () => {
    const mockMenuItemsForNonAuth = {
      mainMenu: [
        {
          type: 'item',
          href: `${getConfig().LMS_BASE_URL}${ROUTES.COURSES}`,
          content: messages.exploreCourses.defaultMessage,
          isActive: true,
        },
      ],
      secondaryMenu: [
        {
          type: 'item',
          href: getConfig().SUPPORT_URL,
          content: messages.help.defaultMessage,
        },
      ],
      isNotHomePage: false,
    };
    (useMenuItems as jest.Mock).mockReturnValue(mockMenuItemsForNonAuth);

    const { getByTestId } = render(
      <AppContext.Provider value={{ authenticatedUser: null }}>
        <CatalogHeader />
      </AppContext.Provider>,
    );

    const mainMenuText = getByTestId('main-menu').textContent;
    const mainMenu = mainMenuText ? JSON.parse(mainMenuText) : [];

    expect(mainMenu).toHaveLength(1);
    expect(mainMenu[0].href).toBe(`${getConfig().LMS_BASE_URL}${ROUTES.COURSES}`);
    expect(mainMenu[0].content).toBe(messages.exploreCourses.defaultMessage);
    expect(mainMenu[0].isActive).toBe(true);
  });
});
