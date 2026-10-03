import { getAuthenticatedHttpClient, getAuthenticatedUser, getHttpClient } from '@edx/frontend-platform/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';

import { renderHook, waitFor } from '@src/setupTest';
import { mockCourseAboutResponse } from '@src/__mocks__';
import { useCourseAboutData, useEnrollment } from '../hooks';
import { fetchCourseAboutData, changeCourseEnrolment } from '../api';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
  getAuthenticatedUser: jest.fn(),
  getHttpClient: jest.fn(),
}));

describe('Course About Data Layer', () => {
  const courseId = 'course-v1:test+123+2024';
  const redirectUrl = '/dashboard';
  const mockHttpClient = {
    get: jest.fn(),
    post: jest.fn(),
  };

  let originalLocation: Location;
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();

    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue(mockHttpClient);
    (getHttpClient as jest.Mock).mockReturnValue(mockHttpClient);
    (getAuthenticatedUser as jest.Mock).mockReturnValue(null);

    originalLocation = window.location;

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  const renderHookWithClient = (hook: () => any) => renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
  });

  describe('API Functions', () => {
    it('fetchCourseAboutData should fetch and transform course data', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ data: mockCourseAboutResponse });

      const result = await fetchCourseAboutData(courseId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining(courseId));
      expect(result).toEqual(mockCourseAboutResponse);
    });

    it('changeCourseEnrolment should make a POST request with correct data', async () => {
      const mockResponse = { data: { success: true } };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await changeCourseEnrolment(courseId);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        {
          course_id: courseId,
          enrollment_action: 'enroll',
        },
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        }),
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('Hooks', () => {
    it('useCourseAboutData should fetch and return course data', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ data: mockCourseAboutResponse });

      const { result } = renderHookWithClient(() => useCourseAboutData(courseId));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockCourseAboutResponse);
    });

    it('useEnrollment should handle successful enrollment', async () => {
      const onError = jest.fn();
      const errorMessage = 'Enrollment failed';

      mockHttpClient.post.mockResolvedValueOnce({ data: { success: true } });
      const { result } = renderHookWithClient(() => useEnrollment({ onError, errorMessage }));

      await result.current(courseId, redirectUrl);

      expect(mockHttpClient.post).toHaveBeenCalled();
      expect(window.location.href).toBe(redirectUrl);
    });

    it('useEnrollment should handle 403 error and redirect to login', async () => {
      const onError = jest.fn();
      const errorMessage = 'Enrollment failed';

      mockHttpClient.post.mockRejectedValueOnce({
        customAttributes: { httpErrorStatus: 403 },
      });

      const { result } = renderHookWithClient(() => useEnrollment({ onError, errorMessage }));

      await result.current(courseId, redirectUrl);

      const expectedLoginUrl = `${getConfig().LOGIN_URL}?next=${encodeURIComponent(`/courses/${courseId}/about`)}`;
      expect(window.location.href).toBe(expectedLoginUrl);
      expect(onError).not.toHaveBeenCalled();
    });

    it('useEnrollment should handle other errors', async () => {
      const onError = jest.fn();
      const errorMessage = 'Enrollment failed';

      mockHttpClient.post.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHookWithClient(() => useEnrollment({ onError, errorMessage }));

      await result.current(courseId, redirectUrl);

      expect(onError).toHaveBeenCalledWith(errorMessage);
    });
  });
  it('fetches anonymous about data without requesting an authenticated client', async () => {
    mockHttpClient.get.mockResolvedValueOnce({ data: mockCourseAboutResponse });
    await fetchCourseAboutData(courseId);
    expect(getHttpClient).toHaveBeenCalledTimes(1);
    expect(getAuthenticatedHttpClient).not.toHaveBeenCalled();
  });

  it('preserves the authenticated data path for signed-in learners', async () => {
    (getAuthenticatedUser as jest.Mock).mockReturnValue({ username: 'learner' });
    mockHttpClient.get.mockResolvedValueOnce({ data: mockCourseAboutResponse });
    await fetchCourseAboutData(courseId);
    expect(getAuthenticatedHttpClient).toHaveBeenCalledTimes(1);
    expect(getHttpClient).not.toHaveBeenCalled();
  });

  it.each([[403, 'public'], [404, 'public'], [403, 'authenticated'], [404, 'authenticated']])('does not retry terminal course-about HTTP %s (%s client)', async (status, client) => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
    const error = client === 'public'
      ? { response: { status } } : { customAttributes: { httpErrorStatus: status } };
    mockHttpClient.get.mockRejectedValue(error);
    const { result } = renderHookWithClient(() => useCourseAboutData(courseId));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  it('still retries a transient course-about failure', async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
    mockHttpClient.get.mockRejectedValueOnce({ customAttributes: { httpErrorStatus: 503 } });
    mockHttpClient.get.mockResolvedValue({ data: mockCourseAboutResponse });
    const { result } = renderHookWithClient(() => useCourseAboutData(courseId));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
  });
});
