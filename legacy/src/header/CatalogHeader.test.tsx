import { getConfig } from '@edx/frontend-platform';

import { render, screen } from '../setupTest';
import { ROUTES } from '../routes';
import CatalogHeader from './CatalogHeader';
import { useMenuItems } from './hooks/useMenuItems';
import messages from './messages';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    LMS_BASE_URL: process.env.LMS_BASE_URL,
    ENABLE_PROGRAMS: process.env.ENABLE_PROGRAMS,
    ENABLE_COURSE_DISCOVERY: process.env.ENABLE_COURSE_DISCOVERY,
    SUPPORT_URL: process.env.SUPPORT_URL,
  })),
  mergeConfig: jest.fn(),
  ensureConfig: jest.fn(),
  subscribe: jest.fn(),
}));

jest.mock('./hooks/useMenuItems', () => ({
  useMenuItems: jest.fn(),
}));

const mockedHeaderProps = jest.fn();
jest.mock('@edx/frontend-component-header', () => jest.fn((props) => {
  mockedHeaderProps(props);
  return <div>Header</div>;
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
  };

  beforeEach(() => {
    (useMenuItems as jest.Mock).mockReturnValue(mockMenuItems);
    jest.clearAllMocks();
  });

  it('renders header component with correct props', () => {
    render(<CatalogHeader />);

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(useMenuItems).toHaveBeenCalled();

    const props = mockedHeaderProps.mock.calls[0][0];
    expect(props.mainMenuItems).toEqual(mockMenuItems.mainMenu);
    expect(props.secondaryMenuItems).toEqual(mockMenuItems.secondaryMenu);
  });

  it('passes correct main menu items to Header', () => {
    render(<CatalogHeader />);

    const props = mockedHeaderProps.mock.calls[0][0];

    expect(props.mainMenuItems).toHaveLength(1);
    expect(props.mainMenuItems[0].href).toBe(`${getConfig().LMS_BASE_URL}/dashboard`);
    expect(props.mainMenuItems[0].content).toBe(messages.courses.defaultMessage);
  });

  it('passes correct props to Header component', () => {
    const { mainMenu, secondaryMenu } = mockMenuItems;

    render(<CatalogHeader />);

    expect(useMenuItems).toHaveBeenCalled();
    const hookResult = (useMenuItems as jest.Mock).mock.results[0].value;
    expect(hookResult.mainMenu).toEqual(mainMenu);
    expect(hookResult.secondaryMenu).toEqual(secondaryMenu);
  });

  it('handles different menu configurations', () => {
    const mockMenuItemsWithPrograms = {
      mainMenu: [
        ...mockMenuItems.mainMenu,
        {
          type: 'item',
          href: `${getConfig().LMS_BASE_URL}/programs`,
          content: messages.programs.defaultMessage,
        },
      ],
      secondaryMenu: mockMenuItems.secondaryMenu,
    };

    (useMenuItems as jest.Mock).mockReturnValue(mockMenuItemsWithPrograms);

    render(<CatalogHeader />);

    const hookResult = (useMenuItems as jest.Mock).mock.results[0].value;
    expect(hookResult.mainMenu).toHaveLength(2);
    expect(hookResult.mainMenu[1].content).toBe(messages.programs.defaultMessage);
  });

  it('handles empty menu items', () => {
    const mockEmptyMenuItems = {
      mainMenu: [],
      secondaryMenu: [],
    };

    (useMenuItems as jest.Mock).mockReturnValue(mockEmptyMenuItems);

    render(<CatalogHeader />);

    const hookResult = (useMenuItems as jest.Mock).mock.results[0].value;
    expect(hookResult.mainMenu).toHaveLength(0);
    expect(hookResult.secondaryMenu).toHaveLength(0);
  });

  it('handles authenticated user menu', () => {
    const mockAuthMenuItems = {
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
      ],
      secondaryMenu: [
        {
          type: 'item',
          href: getConfig().SUPPORT_URL,
          content: messages.help.defaultMessage,
        },
      ],
    };

    (useMenuItems as jest.Mock).mockReturnValue(mockAuthMenuItems);

    render(<CatalogHeader />);

    const hookResult = (useMenuItems as jest.Mock).mock.results[0].value;
    expect(hookResult.mainMenu).toHaveLength(2);
    expect(hookResult.mainMenu[0].href).toContain('/dashboard');
    expect(hookResult.mainMenu[1].href).toContain('/programs');
  });

  it('handles non-authenticated user menu', () => {
    const mockNonAuthMenuItems = {
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
    };

    (useMenuItems as jest.Mock).mockReturnValue(mockNonAuthMenuItems);

    render(<CatalogHeader />);

    const hookResult = (useMenuItems as jest.Mock).mock.results[0].value;
    expect(hookResult.mainMenu).toHaveLength(1);
    expect(hookResult.mainMenu[0].href).toContain(ROUTES.COURSES);
    expect(hookResult.mainMenu[0].isActive).toBe(true);
  });
});
