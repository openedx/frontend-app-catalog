import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';

import { renderHook, waitFor } from '@src/setupTest';
import { mockCourseAboutResponse } from '@src/__mocks__';
import { useCourseAboutData, useEnrollment } from '../hooks';
import { fetchCourseAboutData, changeCourseEnrolment } from '../api';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
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
});
