import { mockPathwayDetailData } from '@src/__mocks__/pathway';

import type { PathwayDetailData } from '../types';

// shortcut: bundled sample data, replace with the pathway API when its endpoint is available.
/**
 * Any nonblank id resolves to a shallow copy of the sample record under that id;
 * a blank or whitespace-only id resolves to null. Never undefined: React Query
 * only accepts that as successful data.
 */
export const fetchPathwayDetail = async (pathwayId: string): Promise<PathwayDetailData | null> => (
  pathwayId.trim() ? { ...mockPathwayDetailData, id: pathwayId } : null
);
