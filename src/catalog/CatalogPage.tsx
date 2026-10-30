import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Alert } from '@openedx/paragon';
import {
  ErrorPage, getSiteConfig, useIntl,
} from '@openedx/frontend-base';
import { useSearchParams } from 'react-router-dom';

import { getStringConfig } from '@src/config';
import { DEFAULT_PAGE_SIZE } from '@src/data/catalog-search/constants';
import { useCatalogSearch } from '@src/data/catalog-search/hooks';
import CourseCatalogIntroSlot from '@src/slots/CourseCatalogIntroSlot';
import { CourseCatalogDataTableSlot } from '@src/slots/CourseCatalogDataTableSlots';
import CourseCatalogSearchFieldSlot from '@src/slots/CourseCatalogSearchFieldSlot';
import { useDebouncedSearchInput } from './hooks/useDebouncedSearchInput';
import { AlertNotification, Loading } from '../generic';
import { useCatalog } from './hooks/useCatalog';
import messages from './messages';
import { transformAggregationsToFilterChoices } from './utils';

const CatalogPage = () => {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search_query') || '';
  const {
    data: catalogData,
    isLoading,
    isError,
    fetchData,
    isFetching,
  } = useCatalogSearch({ searchString: searchQuery });

  const {
    pageIndex,
    filterState,
    searchString,
    hasInitializedFromUrl,
    urlSearchQuery,
    previousCatalogData,
    handleSearch,
    handleFetchData,
    resetFilterProgress,
  } = useCatalog({
    fetchData, catalogData, isFetching, searchParams, setSearchParams,
  });

  const { setSearchInput } = useDebouncedSearchInput({
    searchString,
    handleSearch,
  });

  /**
   * Determines which data to display in the catalog based on search state and results.
   * Shows previous catalog data when:
   * - User has an active search but no results were found
   * This provides better UX by showing cached data instead of empty state.
   */
  const displayData = useMemo(() => {
    const hasSearchResults = (catalogData?.results?.length ?? 0) > 0;
    const hasActiveSearch = Boolean(searchString);

    const shouldShowPreviousData = hasActiveSearch && !hasSearchResults && previousCatalogData;

    return shouldShowPreviousData ? previousCatalogData : catalogData;
  }, [catalogData, searchString, previousCatalogData]);

  useEffect(() => {
    if (!isFetching && filterState.isFilterChangeInProgress) {
      resetFilterProgress();
    }
  }, [isFetching, filterState.isFilterChangeInProgress, resetFilterProgress]);

  const tableColumns = useMemo(
    () => transformAggregationsToFilterChoices(displayData?.aggs, intl),
    [displayData?.aggs, intl],
  );

  if (isLoading || (!hasInitializedFromUrl && urlSearchQuery)) {
    return (
      <Loading />
    );
  }

  if (isError) {
    return (
      <Container className="py-5.5">
        <Alert variant="danger">
          <ErrorPage
            // @ts-expect-error frontend-base ErrorPage declares message?: null but renders the prop as text. Remove when typing is fixed upstream.
            message={intl.formatMessage(messages.errorMessage, {
              supportEmail: getStringConfig('INFO_EMAIL'),
            })}
          />
        </Alert>
      </Container>
    );
  }

  const totalItems = displayData?.results?.length ?? 0;
  const pageCount = Math.ceil((displayData?.total || totalItems) / DEFAULT_PAGE_SIZE);
  const hasItems = totalItems > 0 || (previousCatalogData?.total ?? 0) > 0;

  return (
    <>
      <Helmet>
        <title>
          {intl.formatMessage(messages.pageTitle, {
            siteName: getSiteConfig().siteName,
          })}
        </title>
      </Helmet>
      <Container fluid={false} size="xl" className="pt-5.5 mb-6">
        <CourseCatalogIntroSlot searchString={searchString} courseDataResultsLength={catalogData?.results?.length} />
        {hasItems ? (
          <>
            <CourseCatalogSearchFieldSlot
              setSearchInput={setSearchInput}
              handleSearch={handleSearch}
              initialSearchValue={searchString}
            />
            <CourseCatalogDataTableSlot
              displayData={displayData}
              totalCourses={totalItems}
              pageCount={pageCount}
              pageIndex={pageIndex}
              tableColumns={tableColumns}
              handleFetchData={handleFetchData}
            />
          </>
        ) : (
          <AlertNotification
            title={intl.formatMessage(messages.noCoursesAvailable)}
            message={intl.formatMessage(messages.noCoursesAvailableMessage)}
          />
        )}
      </Container>
    </>
  );
};

export default CatalogPage;
