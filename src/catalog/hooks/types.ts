import { useSearchParams } from 'react-router-dom';

import type { CatalogSearchResponse, DataTableParams } from '@src/data/catalog-search/types';

export interface UseCatalogProps {
  fetchData: (params: DataTableParams) => void;
  catalogData: CatalogSearchResponse | undefined;
  isFetching: boolean;
  searchParams: ReturnType<typeof useSearchParams>[0];
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}

export interface UseCatalogDataProps {
  catalogData: CatalogSearchResponse | undefined;
  searchString: string;
}

export interface UseSearchProps {
  fetchData: (params: DataTableParams) => void;
  isFetching: boolean;
  searchParams: ReturnType<typeof useSearchParams>[0];
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}

export interface UseDebouncedSearchInputProps {
  searchString: string | null | undefined;
  handleSearch: (value: string) => void;
  debounceDelay?: number;
}
