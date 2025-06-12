import { render, screen } from './setupTest';
import { ROUTES } from './routes';
import App from './App';

jest.mock('@edx/frontend-platform', () => ({
  getAuthenticatedUser: jest.fn(() => ({ username: 'test-user', roles: [] })),
  getConfig: jest.fn(() => ({
    LMS_BASE_URL: '',
    ENABLE_PROGRAMS: true,
    ENABLE_COURSE_DISCOVERY: true,
  })),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="app-provider">{children}</div>,
}));

jest.mock('@openedx/paragon', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@edx/frontend-component-header', () => function getHeader() {
  return <div data-testid="header" />;
});

jest.mock('@edx/frontend-component-footer', () => ({
  FooterSlot: () => <div data-testid="footer" />,
}));

describe('App', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders HomePage on "/" route', () => {
    window.testHistory = [ROUTES.HOME];

    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders CatalogPage on "/courses" route', () => {
    window.testHistory = [ROUTES.COURSES];

    render(<App />);
    expect(screen.getByTestId('catalog-page')).toBeInTheDocument();
  });

  it('renders CourseAboutPage on "/courses/some-course-id/about"', () => {
    window.testHistory = [ROUTES.COURSE_ABOUT];

    render(<App />);
    expect(screen.getByTestId('course-about-page')).toBeInTheDocument();
  });

  it('renders NotFoundPage on unknown route', () => {
    window.testHistory = ['/some-unknown-path'];

    render(<App />);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
});
