import { useSearchParams } from 'react-router-dom';

import type { CatalogListSearchMixedResponse, DataTableParams } from '@src/data/course-list-search/types';

export interface UseCatalogProps {
  fetchData: (params: DataTableParams) => void;
  catalogData: CatalogListSearchMixedResponse | undefined;
  isFetching: boolean;
  searchParams: ReturnType<typeof useSearchParams>[0];
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}

export interface UseCatalogDataProps {
  catalogData: CatalogListSearchMixedResponse | undefined;
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
