import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { renderHook, waitFor } from '@src/setupTest';
import { mockCourseListSearchResponse } from '@src/__mocks__';
import { fetchCourseListSearch } from '../api';
import { useCourseListSearch } from '../hooks';
import { getCourseListSearchUrl } from '../urls';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockGetAuthenticatedHttpClient = getAuthenticatedHttpClient as jest.Mock;

const CUSTOM_PAGE_SIZE = 21;
const CUSTOM_PAGE_INDEX = 2;

describe('Course List Search Data Layer', () => {
  describe('fetchCourseListSearch', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should fetch course list search data with default parameters', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCourseListSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const result = await fetchCourseListSearch();

      expect(mockPost).toHaveBeenCalledTimes(1);
      const [url] = mockPost.mock.calls[0];
      expect(url).toBe(getCourseListSearchUrl());
      expect(result).toEqual(mockCourseListSearchResponse);
    });

    it('should fetch course list search data with custom parameters', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCourseListSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await fetchCourseListSearch(CUSTOM_PAGE_SIZE, CUSTOM_PAGE_INDEX, true);

      const [url, formData] = mockPost.mock.calls[0];

      expect(url).toBe(getCourseListSearchUrl());
      expect((formData as FormData).get('page_size')).toBe(String(CUSTOM_PAGE_SIZE));
      expect((formData as FormData).get('page_index')).toBe(String(CUSTOM_PAGE_INDEX));
      expect((formData as FormData).get('enable_course_sorting_by_start_date')).toBe('true');
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      const mockPost = jest.fn().mockRejectedValue(error);
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await expect(fetchCourseListSearch()).rejects.toThrow('API Error');
    });
  });

  describe('useCourseListSearch', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    beforeEach(() => {
      jest.clearAllMocks();
      queryClient.clear();
    });

    it('should return loading state initially', () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCourseListSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const { result } = renderHook(() => useCourseListSearch(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should return data when fetch is successful', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCourseListSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const { result } = renderHook(() => useCourseListSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockCourseListSearchResponse);
      expect(result.current.isError).toBe(false);
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      const mockPost = jest.fn().mockRejectedValue(error);
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const { result } = renderHook(() => useCourseListSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
    });
  });
});
