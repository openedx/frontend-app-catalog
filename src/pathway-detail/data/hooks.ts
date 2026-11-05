import { useQuery } from '@tanstack/react-query';

import { fetchPathwayDetail } from './api';

/**
 * Pathway detail for the route id.
 *
 * Disabled while the id is blank, so a missing route parameter renders as
 * not-found instead of leaving a query pending forever.
 */
export const usePathwayDetail = (pathwayId: string) => useQuery({
  queryKey: ['pathwayDetail', pathwayId],
  queryFn: () => fetchPathwayDetail(pathwayId),
  enabled: Boolean(pathwayId.trim()),
});
