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

      const result = await fetchCourseListSearch({});

      expect(mockPost).toHaveBeenCalledTimes(1);
      const [url] = mockPost.mock.calls[0];
      expect(url).toBe(getCourseListSearchUrl());
      expect(result).toEqual(mockCourseListSearchResponse);
    });

    it('should fetch course list search data with custom parameters', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCourseListSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await fetchCourseListSearch({
        pageSize: CUSTOM_PAGE_SIZE,
        pageIndex: CUSTOM_PAGE_INDEX,
        enableCourseSortingByStartDate: true,
      });

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

      await expect(fetchCourseListSearch({})).rejects.toThrow('API Error');
    });

    it('should fetch course list search data with filters', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCourseListSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await fetchCourseListSearch({
        filters: {
          language: ['en', 'es'],
          org: ['openedx'],
        },
      });

      const [url, formData] = mockPost.mock.calls[0];

      expect(url).toBe(getCourseListSearchUrl());
      expect((formData as FormData).getAll('language')).toEqual(['en', 'es']);
      expect((formData as FormData).getAll('org')).toEqual(['openedx']);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      const mockPost = jest.fn().mockRejectedValue(error);
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await expect(fetchCourseListSearch({})).rejects.toThrow('API Error');
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

    it('should initialize with custom parameters', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCourseListSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const customParams = {
        pageSize: CUSTOM_PAGE_SIZE,
        pageIndex: CUSTOM_PAGE_INDEX,
        enableCourseSortingByStartDate: true,
        filters: { language: ['en'] },
      };

      const { result } = renderHook(
        () => useCourseListSearch(customParams),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockPost).toHaveBeenCalled();
      const [, formData] = mockPost.mock.calls[0];
      expect((formData as FormData).get('page_size')).toBe(String(CUSTOM_PAGE_SIZE));
      expect((formData as FormData).get('page_index')).toBe(String(CUSTOM_PAGE_INDEX));
    });

    describe('fetchData', () => {
      it('should update params and refetch data', async () => {
        const mockPost = jest.fn()
          .mockResolvedValueOnce({ data: mockCourseListSearchResponse })
          .mockResolvedValueOnce({ data: { ...mockCourseListSearchResponse, total: 10 } });

        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(() => useCourseListSearch(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(mockPost).toHaveBeenCalledTimes(1);

        result.current.fetchData({
          pageSize: 10,
          pageIndex: 1,
        });

        await waitFor(() => {
          expect(mockPost).toHaveBeenCalledTimes(2);
        });

        const [, secondFormData] = mockPost.mock.calls[1];
        expect((secondFormData as FormData).get('page_size')).toBe('10');
        expect((secondFormData as FormData).get('page_index')).toBe('1');
      });

      it('should transform DataTable filters to API format', async () => {
        const mockPost = jest.fn()
          .mockResolvedValueOnce({ data: mockCourseListSearchResponse })
          .mockResolvedValueOnce({ data: mockCourseListSearchResponse });

        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(() => useCourseListSearch(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        result.current.fetchData({
          pageSize: 2,
          pageIndex: 0,
          filters: [
            { id: 'language', value: ['en', 'es'] },
            { id: 'org', value: ['openedx'] },
          ],
        });

        await waitFor(() => {
          expect(mockPost).toHaveBeenCalledTimes(2);
        });

        const [, secondFormData] = mockPost.mock.calls[1];
        expect((secondFormData as FormData).getAll('language')).toEqual(['en', 'es']);
        expect((secondFormData as FormData).getAll('org')).toEqual(['openedx']);
      });

      it('should not refetch if params have not changed', async () => {
        const mockPost = jest.fn().mockResolvedValue({ data: mockCourseListSearchResponse });
        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(
          () => useCourseListSearch({ pageSize: 10, pageIndex: 1 }),
          { wrapper },
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        // First fetchData call with different params
        result.current.fetchData({
          pageSize: 5,
          pageIndex: 2,
          filters: [{ id: 'language', value: ['en'] }],
        });

        await waitFor(() => {
          expect(mockPost).toHaveBeenCalledTimes(2); // initial + first fetchData
        });

        const callCountAfterChange = mockPost.mock.calls.length;

        // Second fetchData call with SAME params as first
        result.current.fetchData({
          pageSize: 5,
          pageIndex: 2,
          filters: [{ id: 'language', value: ['en'] }],
        });

        await new Promise(resolve => {
          setTimeout(resolve, 100);
        });

        // Should not make another call
        expect(mockPost).toHaveBeenCalledTimes(callCountAfterChange);
      });

      it('should handle empty filters array', async () => {
        const mockPost = jest.fn()
          .mockResolvedValueOnce({ data: mockCourseListSearchResponse })
          .mockResolvedValueOnce({ data: mockCourseListSearchResponse });

        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(() => useCourseListSearch(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        result.current.fetchData({
          pageSize: 2,
          pageIndex: 0,
          filters: [],
        });

        // Should still work with empty filters
        expect(result.current.fetchData).toBeDefined();
      });

      it('should handle multiple filter changes', async () => {
        const mockPost = jest.fn()
          .mockResolvedValueOnce({ data: mockCourseListSearchResponse })
          .mockResolvedValueOnce({ data: mockCourseListSearchResponse })
          .mockResolvedValueOnce({ data: mockCourseListSearchResponse });

        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(() => useCourseListSearch(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        // First filter change
        result.current.fetchData({
          pageSize: 2,
          pageIndex: 0,
          filters: [{ id: 'language', value: ['en'] }],
        });

        await waitFor(() => {
          expect(mockPost).toHaveBeenCalledTimes(2);
        });

        // Second filter change
        result.current.fetchData({
          pageSize: 2,
          pageIndex: 0,
          filters: [
            { id: 'language', value: ['en'] },
            { id: 'org', value: ['openedx'] },
          ],
        });

        await waitFor(() => {
          expect(mockPost).toHaveBeenCalledTimes(3);
        });
      });

      it('should preserve previous data while fetching (placeholderData)', async () => {
        const initialData = mockCourseListSearchResponse;
        const updatedData = { ...mockCourseListSearchResponse, total: 100 };

        const mockPost = jest.fn()
          .mockResolvedValueOnce({ data: initialData })
          .mockImplementationOnce(() => new Promise(resolve => {
            setTimeout(() => resolve({ data: updatedData }), 100);
          }));

        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(() => useCourseListSearch(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toEqual(initialData);

        result.current.fetchData({
          pageSize: 10,
          pageIndex: 1,
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(true);
        });

        // During fetch, should still have previous data (placeholderData)
        expect(result.current.data).toEqual(initialData);

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.data).toEqual(updatedData);
      });
    });
  });
});
