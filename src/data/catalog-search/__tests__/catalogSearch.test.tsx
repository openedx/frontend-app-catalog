import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { getAuthenticatedHttpClient } from '@openedx/frontend-base';

import { mockCatalogSearchResponse } from '@src/__mocks__';
import { fetchCatalogSearch } from '../api';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '../constants';
import { useCatalogSearch } from '../hooks';
import { getCatalogSearchUrl } from '../urls';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockGetAuthenticatedHttpClient = getAuthenticatedHttpClient as jest.Mock;

const CUSTOM_PAGE_SIZE = 21;
const CUSTOM_PAGE_INDEX = 2;

describe('Catalog Search Data Layer', () => {
  describe('fetchCatalogSearch', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should fetch catalog search data with default parameters', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const result = await fetchCatalogSearch({});

      expect(mockPost).toHaveBeenCalledTimes(1);
      const [url] = mockPost.mock.calls[0];
      expect(url).toBe(getCatalogSearchUrl());
      expect(result).toEqual(mockCatalogSearchResponse);
    });

    it('should fetch catalog search data with custom parameters', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await fetchCatalogSearch({
        pageSize: CUSTOM_PAGE_SIZE,
        pageIndex: CUSTOM_PAGE_INDEX,
        enableCourseSortingByStartDate: true,
      });

      const [url, formData] = mockPost.mock.calls[0];

      expect(url).toBe(getCatalogSearchUrl());
      expect((formData as FormData).get('page_size')).toBe(String(CUSTOM_PAGE_SIZE));
      expect((formData as FormData).get('page_index')).toBe(String(CUSTOM_PAGE_INDEX));
      expect((formData as FormData).get('enable_course_sorting_by_start_date')).toBe('true');
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      const mockPost = jest.fn().mockRejectedValue(error);
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await expect(fetchCatalogSearch({})).rejects.toThrow('API Error');
    });

    it.each([
      ['null, as the LMS sends for an unset setting', null],
      ['a numeric string', '10'],
      ['NaN', NaN],
      ['zero', 0],
      ['negative', -1],
      ['fractional', 1.5],
    ])('should fall back to the default page size when it is %s', async (_label, pageSize) => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await fetchCatalogSearch({ pageSize });

      const [, formData] = mockPost.mock.calls[0];

      expect((formData as FormData).get('page_size')).toBe(String(DEFAULT_PAGE_SIZE));
    });

    it.each([
      ['null', null],
      ['a numeric string', '2'],
      ['NaN', NaN],
      ['negative', -1],
      ['fractional', 1.5],
    ])('should fall back to the default page index when it is %s', async (_label, pageIndex) => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await fetchCatalogSearch({ pageIndex });

      const [, formData] = mockPost.mock.calls[0];

      expect((formData as FormData).get('page_index')).toBe(String(DEFAULT_PAGE_INDEX));
    });

    it('should send the first page index unchanged', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await fetchCatalogSearch({ pageIndex: 0 });

      const [, formData] = mockPost.mock.calls[0];

      expect((formData as FormData).get('page_index')).toBe('0');
    });

    it('should send an over-large page size unchanged, leaving the limit to the backend', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await fetchCatalogSearch({ pageSize: 500 });

      const [, formData] = mockPost.mock.calls[0];

      expect((formData as FormData).get('page_size')).toBe('500');
    });

    it('should fall back to both defaults when pagination is absent', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await fetchCatalogSearch({});

      const [, formData] = mockPost.mock.calls[0];

      expect((formData as FormData).get('page_size')).toBe(String(DEFAULT_PAGE_SIZE));
      expect((formData as FormData).get('page_index')).toBe(String(DEFAULT_PAGE_INDEX));
    });

    it('should fetch catalog search data with filters', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await fetchCatalogSearch({
        filters: {
          language: ['en', 'es'],
          org: ['openedx'],
        },
      });

      const [url, formData] = mockPost.mock.calls[0];

      expect(url).toBe(getCatalogSearchUrl());
      expect((formData as FormData).getAll('language')).toEqual(['en', 'es']);
      expect((formData as FormData).getAll('org')).toEqual(['openedx']);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      const mockPost = jest.fn().mockRejectedValue(error);
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await expect(fetchCatalogSearch({})).rejects.toThrow('API Error');
    });
  });

  describe('useCatalogSearch', () => {
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
      const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const { result } = renderHook(() => useCatalogSearch(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should return data when fetch is successful', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const { result } = renderHook(() => useCatalogSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockCatalogSearchResponse);
      expect(result.current.isError).toBe(false);
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      const mockPost = jest.fn().mockRejectedValue(error);
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const { result } = renderHook(() => useCatalogSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
    });

    it('should initialize with custom parameters', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const customParams = {
        pageSize: CUSTOM_PAGE_SIZE,
        pageIndex: CUSTOM_PAGE_INDEX,
        enableCourseSortingByStartDate: true,
        filters: { language: ['en'] },
      };

      const { result } = renderHook(
        () => useCatalogSearch(customParams),
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
          .mockResolvedValueOnce({ data: mockCatalogSearchResponse })
          .mockResolvedValueOnce({ data: { ...mockCatalogSearchResponse, total: 10 } });

        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(() => useCatalogSearch(), { wrapper });

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
          .mockResolvedValueOnce({ data: mockCatalogSearchResponse })
          .mockResolvedValueOnce({ data: mockCatalogSearchResponse });

        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(() => useCatalogSearch(), { wrapper });

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
        const mockPost = jest.fn().mockResolvedValue({ data: mockCatalogSearchResponse });
        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(
          () => useCatalogSearch({ pageSize: 10, pageIndex: 1 }),
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
          .mockResolvedValueOnce({ data: mockCatalogSearchResponse })
          .mockResolvedValueOnce({ data: mockCatalogSearchResponse });

        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(() => useCatalogSearch(), { wrapper });

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
          .mockResolvedValueOnce({ data: mockCatalogSearchResponse })
          .mockResolvedValueOnce({ data: mockCatalogSearchResponse })
          .mockResolvedValueOnce({ data: mockCatalogSearchResponse });

        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(() => useCatalogSearch(), { wrapper });

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
        const initialData = mockCatalogSearchResponse;
        const updatedData = { ...mockCatalogSearchResponse, total: 100 };

        const mockPost = jest.fn()
          .mockResolvedValueOnce({ data: initialData })
          .mockImplementationOnce(() => new Promise(resolve => {
            setTimeout(() => resolve({ data: updatedData }), 100);
          }));

        mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

        const { result } = renderHook(() => useCatalogSearch(), { wrapper });

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
