import { initialize } from '@edx/frontend-platform';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  APP_READY: 'APP_READY',
  APP_INIT_ERROR: 'APP_INIT_ERROR',
  subscribe: jest.fn(),
  initialize: jest.fn(),
  ensureConfig: jest.fn(),
  getConfig: jest.fn(() => ({
    LMS_BASE_URL: process.env.LMS_BASE_URL,
    ENABLE_PROGRAMS: process.env.ENABLE_PROGRAMS,
    ENABLE_COURSE_DISCOVERY: process.env.ENABLE_COURSE_DISCOVERY,
  })),
}));

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

describe('Index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('should initialize the app with correct configuration', async () => {
    // Import the module to trigger initialization
    await import('./index');

    expect(initialize).toHaveBeenCalledWith({
      messages: expect.any(Object),
    });
  });
});
