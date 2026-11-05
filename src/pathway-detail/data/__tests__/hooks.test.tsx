import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockPathwayDetailData } from '@src/__mocks__/pathway';

import { fetchPathwayDetail } from '../api';
import { usePathwayDetail } from '../hooks';

jest.mock('../api', () => ({
  fetchPathwayDetail: jest.fn(),
}));

const mockFetchPathwayDetail = fetchPathwayDetail as jest.Mock;

/** One client per test: a shared cache would let a later case skip the fetch. */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('usePathwayDetail', () => {
  beforeEach(() => {
    mockFetchPathwayDetail.mockReset();
  });

  it('reports pending until the record arrives, then returns it', async () => {
    mockFetchPathwayDetail.mockResolvedValue({ ...mockPathwayDetailData, id: 'pathway-1' });

    const { result } = renderHook(() => usePathwayDetail('pathway-1'), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('pathway-1');
    expect(mockFetchPathwayDetail).toHaveBeenCalledWith('pathway-1');
  });

  it('reports the failure when the fetch rejects', async () => {
    mockFetchPathwayDetail.mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => usePathwayDetail('pathway-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(new Error('offline'));
  });

  it('settles an empty response as successful data, keeping not-found out of the error state', async () => {
    mockFetchPathwayDetail.mockResolvedValue(null);

    const { result } = renderHook(() => usePathwayDetail('pathway-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('does not fetch, or stay in a loading state, while the id is blank', () => {
    const { result } = renderHook(() => usePathwayDetail('   '), { wrapper: createWrapper() });

    expect(mockFetchPathwayDetail).not.toHaveBeenCalled();
    // Disabled, not merely slow: nothing is in flight, so the page can render
    // its not-found branch instead of waiting forever.
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.isLoading).toBe(false);
  });

  it('keeps the cached record when a refresh fails', async () => {
    mockFetchPathwayDetail.mockResolvedValueOnce({ ...mockPathwayDetailData, id: 'pathway-1' });

    const { result } = renderHook(() => usePathwayDetail('pathway-1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    mockFetchPathwayDetail.mockRejectedValueOnce(new Error('offline'));
    await result.current.refetch();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data?.id).toBe('pathway-1');
  });
});
