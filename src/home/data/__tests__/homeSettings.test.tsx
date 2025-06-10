import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { renderHook, waitFor } from '../../../setupTest';
import { mockHomeSettingsResponse } from '../../__mocks__';
import { fetchHomeSettings } from '../api';
import { getHomeSettingsUrl } from '../urls';
import { useHomeSettingsQuery } from '../hooks';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockGetAuthenticatedHttpClient = getAuthenticatedHttpClient as jest.Mock;

describe('Index Home Data Layer', () => {
  describe('fetchHomeSettings', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should fetch index data', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockHomeSettingsResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ get: mockGet });

      const result = await fetchHomeSettings();
      expect(mockGet).toHaveBeenCalledWith(getHomeSettingsUrl());
      expect(result).toEqual(mockHomeSettingsResponse);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      const mockGet = jest.fn().mockRejectedValue(error);
      mockGetAuthenticatedHttpClient.mockReturnValue({ get: mockGet });

      await expect(fetchHomeSettings()).rejects.toThrow('API Error');
    });
  });

  describe('useHomeSettingsQuery', () => {
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
      const mockGet = jest.fn().mockResolvedValue({ data: mockHomeSettingsResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ get: mockGet });

      const { result } = renderHook(() => useHomeSettingsQuery(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should return data when fetch is successful', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockHomeSettingsResponse });
      mockGetAuthenticatedHttpClient.mockReturnValue({ get: mockGet });

      const { result } = renderHook(() => useHomeSettingsQuery(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockHomeSettingsResponse);
      expect(result.current.isError).toBe(false);
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      const mockGet = jest.fn().mockRejectedValue(error);
      mockGetAuthenticatedHttpClient.mockReturnValue({ get: mockGet });

      const { result } = renderHook(() => useHomeSettingsQuery(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
    });
  });
});
