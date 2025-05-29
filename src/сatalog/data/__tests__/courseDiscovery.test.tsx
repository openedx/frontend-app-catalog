import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { renderHook, waitFor } from '../../../setupTest';
import { mockCourseDiscoveryResponse } from '../../__mocks__';
import { fetchCourseDiscovery } from '../api';
import { useCourseDiscovery } from '../hooks';
import { getCourseDiscoveryUrl } from '../urls';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_INDEX } from '../constants';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockGetAuthenticatedHttpClient = getAuthenticatedHttpClient as jest.Mock;

describe('Course Discovery Data Layer', () => {
  describe('fetchCourseDiscovery', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should fetch course discovery data with default parameters', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCourseDiscoveryResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const result = await fetchCourseDiscovery();

      expect(mockPost).toHaveBeenCalledWith(getCourseDiscoveryUrl(), {
        page_size: DEFAULT_PAGE_SIZE,
        page_index: DEFAULT_PAGE_INDEX,
      });
      expect(result).toEqual(mockCourseDiscoveryResponse);
    });

    it('should fetch course discovery data with custom parameters', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCourseDiscoveryResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const customPageSize = 21;
      const customPageIndex = 2;

      await fetchCourseDiscovery(customPageSize, customPageIndex);

      expect(mockPost).toHaveBeenCalledWith(getCourseDiscoveryUrl(), {
        page_size: customPageSize,
        page_index: customPageIndex,
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      const mockPost = jest.fn().mockRejectedValue(error);
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      await expect(fetchCourseDiscovery()).rejects.toThrow('API Error');
    });
  });

  describe('useCourseDiscovery', () => {
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
      const mockPost = jest.fn().mockResolvedValue({ data: mockCourseDiscoveryResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const { result } = renderHook(() => useCourseDiscovery(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should return data when fetch is successful', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockCourseDiscoveryResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const { result } = renderHook(() => useCourseDiscovery(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockCourseDiscoveryResponse);
      expect(result.current.isError).toBe(false);
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      const mockPost = jest.fn().mockRejectedValue(error);
      mockGetAuthenticatedHttpClient.mockReturnValue({ post: mockPost });

      const { result } = renderHook(() => useCourseDiscovery(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
    });
  });
});
