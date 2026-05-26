import {
  useEffect, useMemo, useState, useDeferredValue, useRef,
} from 'react';
import debounce from 'lodash.debounce';

import type { UseDebouncedSearchInputProps } from './types';

/**
 * Custom hook for managing debounced search input with deferred value optimization.
 */
export const useDebouncedSearchInput = ({
  searchString,
  handleSearch,
  debounceDelay = 300,
}: UseDebouncedSearchInputProps) => {
  const [searchInput, setSearchInput] = useState(searchString ?? '');
  const deferredSearchInput = useDeferredValue(searchInput);
  const lastQueryRef = useRef('');

  useEffect(() => {
    setSearchInput(searchString ?? '');
  }, [searchString]);

  const debouncedHandleSearch = useMemo(
    () => debounce((value: string) => {
      handleSearch(value);
    }, debounceDelay),
    [handleSearch, debounceDelay],
  );

  useEffect(() => () => debouncedHandleSearch.cancel(), [debouncedHandleSearch]);

  useEffect(() => {
    if (deferredSearchInput === lastQueryRef.current) {
      return;
    }

    lastQueryRef.current = deferredSearchInput;
    debouncedHandleSearch(deferredSearchInput);
  }, [deferredSearchInput, debouncedHandleSearch]);

  return { setSearchInput };
};
