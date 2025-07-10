import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { renderHook, waitFor } from '../../../setupTest';
import { mockFrontendParamsResponse } from '../../../__mocks__';
import { useFrontendParamsQuery, usePrefetchFrontendParams } from '../hooks';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockGetAuthenticatedHttpClient = getAuthenticatedHttpClient as jest.Mock;

describe('Frontend Params Hooks', () => {
  describe('useFrontendParamsQuery', () => {
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
      const mockGet = jest.fn().mockResolvedValue({ data: mockFrontendParamsResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ get: mockGet });

      const { result } = renderHook(() => useFrontendParamsQuery(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should use correct query key', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockFrontendParamsResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ get: mockGet });

      renderHook(() => useFrontendParamsQuery(), { wrapper });

      await waitFor(() => {
        const queries = queryClient.getQueryCache().getAll();
        expect(queries).toHaveLength(1);
        expect(queries[0].queryKey).toEqual(['frontendParams']);
      });
    });

    it('should configure stale time and gc time correctly', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockFrontendParamsResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ get: mockGet });

      renderHook(() => useFrontendParamsQuery(), { wrapper });

      await waitFor(() => {
        const queries = queryClient.getQueryCache().getAll();
        expect(queries).toHaveLength(1);
        expect(queries[0].queryKey).toEqual(['frontendParams']);
      });
    });
  });

  describe('usePrefetchFrontendParams', () => {
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

    it('should prefetch with correct query key', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockFrontendParamsResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ get: mockGet });

      const { result } = renderHook(() => usePrefetchFrontendParams(), { wrapper });

      await result.current();

      await waitFor(() => {
        const queries = queryClient.getQueryCache().getAll();
        expect(queries).toHaveLength(1);
        expect(queries[0].queryKey).toEqual(['frontendParams']);
      });
    });
  });
});
