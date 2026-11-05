import { mockPathwayDetailData } from '@src/__mocks__/pathway';

import { fetchPathwayDetail } from '../api';

describe('fetchPathwayDetail', () => {
  it('returns the shared sample record carrying the requested id', async () => {
    await expect(fetchPathwayDetail('pathway-1')).resolves.toMatchObject({
      ...mockPathwayDetailData,
      id: 'pathway-1',
    });
  });

  it('resolves each nonblank id independently', async () => {
    const [first, second] = await Promise.all([
      fetchPathwayDetail('pathway-1'),
      fetchPathwayDetail('pathway-2'),
    ]);

    expect(first?.id).toBe('pathway-1');
    expect(second?.id).toBe('pathway-2');
  });

  it('returns a copy, so callers cannot mutate the shared sample', async () => {
    const record = await fetchPathwayDetail('pathway-1');
    record!.name = 'Changed by a caller';

    await expect(fetchPathwayDetail('pathway-1')).resolves.toMatchObject({
      name: mockPathwayDetailData.name,
    });
    expect(mockPathwayDetailData.name).not.toBe('Changed by a caller');
  });

  it('returns null for blank and whitespace-only ids', async () => {
    await expect(fetchPathwayDetail('')).resolves.toBeNull();
    await expect(fetchPathwayDetail('   ')).resolves.toBeNull();
  });
});
