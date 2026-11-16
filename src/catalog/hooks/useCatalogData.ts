import { useState, useEffect } from 'react';

import type { CatalogSearchResponse } from '@src/data/catalog-search/types';
import type { UseCatalogDataProps } from './types';

/**
 * Custom hook for managing catalog data caching.
 *
 * This hook provides functionality to:
 * - Cache previous catalog data when not searching
 * - Manage data persistence for better UX
 */
export const useCatalogData = ({
  catalogData,
  searchString,
}: UseCatalogDataProps) => {
  const [previousCatalogData, setPreviousCatalogData] = useState<CatalogSearchResponse | null>(null);

  /**
   * Handles catalog data state changes.
   */
  useEffect(() => {
    if (catalogData && !searchString && catalogData.total > 0) {
      setPreviousCatalogData(catalogData);
    }
  }, [catalogData, searchString]);

  return { previousCatalogData };
};
