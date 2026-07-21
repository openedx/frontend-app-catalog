import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  getAppConfig, getAuthenticatedUser, getSiteConfig, IntlProvider,
} from '@openedx/frontend-base';

import { appId, catalogRole, coursesRole } from '../../constants';
import catalogHeaderApp from './app';
import CoursesLinkMenuItem from './CoursesLinkMenuItem';
import DiscoverLinkMenuItem from './DiscoverLinkMenuItem';
import ExploreCoursesLinkMenuItem from './ExploreCoursesLinkMenuItem';
import ProgramsLinkMenuItem from './ProgramsLinkMenuItem';
import messages from './messages';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAppConfig: jest.fn(),
  getAuthenticatedUser: jest.fn(),
  getUrlByRouteRole: jest.fn(() => '/catalog/courses'),
  LinkMenuItem: ({
    label, url, role, variant,
  }: { label: string, url?: string, role?: string, variant?: string }) => (
    <a href={url ?? '#'} data-role={role} data-variant={variant}>{label}</a>
  ),
}));

const { getAppConfig: actualGetAppConfig } = jest.requireActual('@openedx/frontend-base');
const mockedGetAppConfig = getAppConfig as jest.Mock;
const mockedGetAuthenticatedUser = getAuthenticatedUser as jest.Mock;

const HEADER_LINKS_SLOT = 'org.openedx.frontend.slot.header.primaryLinks.v1';

const widgetById = (id: string) => (
  catalogHeaderApp.slots.find(slot => 'id' in slot && slot.id === id)
);

const runCondition = (widgetId: string) => {
  const slot = widgetById(widgetId);
  if (!slot || !('condition' in slot) || !slot.condition?.callback) {
    throw new Error(`No condition.callback on slot ${widgetId}`);
  }
  return slot.condition.callback();
};

const renderMenuItem = (ui: React.ReactElement) => render(
  <IntlProvider locale="en"><MemoryRouter>{ui}</MemoryRouter></IntlProvider>,
);

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetAppConfig.mockImplementation(actualGetAppConfig);
  mockedGetAuthenticatedUser.mockReturnValue(null);
});

describe('catalogHeaderApp', () => {
  it('declares its own appId distinct from the catalog app', () => {
    expect(catalogHeaderApp.appId).toBe('org.openedx.frontend.app.catalog.header');
    expect(catalogHeaderApp.appId).not.toBe(appId);
  });

  it('targets the primary header links slot for all menu widgets', () => {
    const menuSlotOps = catalogHeaderApp.slots.filter(
      slot => slot.slotId === HEADER_LINKS_SLOT,
    );
    expect(menuSlotOps).toHaveLength(4);
    menuSlotOps.forEach(slot => {
      expect('condition' in slot && slot.condition?.active).toContain(catalogRole);
    });
  });

  describe('Courses menu item condition', () => {
    const id = 'org.openedx.frontend.widget.catalog.headerLinkCourses.v1';

    it('shows when the user is authenticated', () => {
      mockedGetAuthenticatedUser.mockReturnValue({ username: 'testuser' });
      expect(runCondition(id)).toBe(true);
    });

    it('hides when the user is not authenticated', () => {
      mockedGetAuthenticatedUser.mockReturnValue(null);
      expect(runCondition(id)).toBe(false);
    });
  });

  describe('Programs menu item condition', () => {
    const id = 'org.openedx.frontend.widget.catalog.headerLinkPrograms.v1';

    it('shows when authenticated AND ENABLE_PROGRAMS is true', () => {
      mockedGetAuthenticatedUser.mockReturnValue({ username: 'testuser' });
      expect(runCondition(id)).toBe(true);
    });

    it('hides when authenticated AND ENABLE_PROGRAMS is false', () => {
      mockedGetAuthenticatedUser.mockReturnValue({ username: 'testuser' });
      mockedGetAppConfig.mockReturnValue({
        ...actualGetAppConfig(appId),
        ENABLE_PROGRAMS: false,
      });
      expect(runCondition(id)).toBe(false);
    });

    it('hides when not authenticated regardless of config', () => {
      mockedGetAuthenticatedUser.mockReturnValue(null);
      expect(runCondition(id)).toBe(false);
    });
  });

  describe('Discover menu item condition', () => {
    const id = 'org.openedx.frontend.widget.catalog.headerLinkDiscover.v1';

    it('shows when authenticated AND NON_BROWSABLE_COURSES is not true', () => {
      mockedGetAuthenticatedUser.mockReturnValue({ username: 'testuser' });
      expect(runCondition(id)).toBe(true);
    });

    it('hides when authenticated AND NON_BROWSABLE_COURSES is true', () => {
      mockedGetAuthenticatedUser.mockReturnValue({ username: 'testuser' });
      mockedGetAppConfig.mockReturnValue({
        ...actualGetAppConfig(appId),
        NON_BROWSABLE_COURSES: true,
      });
      expect(runCondition(id)).toBe(false);
    });

    it('hides when not authenticated', () => {
      mockedGetAuthenticatedUser.mockReturnValue(null);
      expect(runCondition(id)).toBe(false);
    });
  });

  describe('ExploreCourses menu item condition', () => {
    const id = 'org.openedx.frontend.widget.catalog.headerLinkExploreCourses.v1';

    it('shows when NOT authenticated AND ENABLE_COURSE_DISCOVERY is true', () => {
      mockedGetAuthenticatedUser.mockReturnValue(null);
      expect(runCondition(id)).toBe(true);
    });

    it('hides when NOT authenticated AND ENABLE_COURSE_DISCOVERY is false', () => {
      mockedGetAuthenticatedUser.mockReturnValue(null);
      mockedGetAppConfig.mockReturnValue({
        ...actualGetAppConfig(appId),
        ENABLE_COURSE_DISCOVERY: false,
      });
      expect(runCondition(id)).toBe(false);
    });

    it('hides when the user is authenticated regardless of config', () => {
      mockedGetAuthenticatedUser.mockReturnValue({ username: 'testuser' });
      expect(runCondition(id)).toBe(false);
    });
  });
});

describe('CatalogHeader menu item widgets', () => {
  it('CoursesLinkMenuItem renders the Courses label and dashboard URL', () => {
    renderMenuItem(<CoursesLinkMenuItem variant="navLink" />);
    const link = screen.getByRole('link', { name: messages.courses.defaultMessage });
    expect(link).toHaveAttribute('href', `${getSiteConfig().lmsBaseUrl}/dashboard`);
  });

  it('ProgramsLinkMenuItem renders the Programs label and programs URL', () => {
    renderMenuItem(<ProgramsLinkMenuItem variant="navLink" />);
    const link = screen.getByRole('link', { name: messages.programs.defaultMessage });
    expect(link).toHaveAttribute('href', `${getSiteConfig().lmsBaseUrl}/dashboard/programs`);
  });

  // Discover and ExploreCourses pass a `role=` prop through to
  // frontend-base's LinkMenuItem, which resolves the URL from the site
  // config's registered route roles at runtime. We mock LinkMenuItem
  // (above) so the role prop is exposed as a data-attribute for
  // inspection here — the URL resolution itself is frontend-base's
  // responsibility, not ours.
  it('DiscoverLinkMenuItem renders the discoverNew label with the courses role', () => {
    renderMenuItem(<DiscoverLinkMenuItem variant="navLink" />);
    const link = screen.getByRole('link', { name: messages.discoverNew.defaultMessage });
    expect(link).toHaveAttribute('data-role', coursesRole);
    expect(link).toHaveAttribute('data-variant', 'navLink');
  });

  it('ExploreCoursesLinkMenuItem renders the exploreCourses label with the courses role', () => {
    renderMenuItem(<ExploreCoursesLinkMenuItem variant="navLink" />);
    const link = screen.getByRole('link', { name: messages.exploreCourses.defaultMessage });
    expect(link).toHaveAttribute('data-role', coursesRole);
    expect(link).toHaveAttribute('data-variant', 'navLink');
  });
});
