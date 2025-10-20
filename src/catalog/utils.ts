import { CheckboxFilter } from '@openedx/paragon';
import { IntlShape } from '@edx/frontend-platform/i18n';
import capitalize from 'lodash.capitalize';

import type { Aggregations, DataTableFilter } from '@src/data/course-list-search/types';
import messages from './messages';

/**
 * Gets the display name for a language code.
 */
const getLanguageName = (languageCode: string, locale: string = 'en'): string => {
  try {
    const languageNames = new Intl.DisplayNames([locale], { type: 'language' });
    return languageNames.of(languageCode) || languageCode;
  } catch (error) {
    return capitalize(languageCode);
  }
};

/**
 * Transforms aggregations into filter choices for DataTable.
 */
export const transformAggregationsToFilterChoices = (aggregations: Aggregations | undefined, intl: IntlShape) => {
  if (!aggregations) { return []; }

  const headerMap: Record<string, string> = {
    org: intl.formatMessage(messages.organizations),
    language: intl.formatMessage(messages.languages),
    modes: intl.formatMessage(messages.courseTypes),
  };

  return Object.entries(aggregations).map(([key, aggValue]) => {
    const terms = aggValue.terms || {};
    const filterChoices = Object.entries(terms).map(([termKey, count]) => {
      const displayName = key === 'language'
        ? getLanguageName(termKey, intl.locale)
        : capitalize(termKey);

      return {
        name: displayName,
        number: count,
        value: termKey,
      };
    });

    return {
      Header: headerMap[key] || capitalize(key),
      accessor: key,
      Filter: CheckboxFilter,
      filter: 'includesValue',
      filterChoices,
    };
  });
};

/**
 * Compares two arrays of filters and returns true if they are the same.
 */
export const compareFilters = (
  filters1: DataTableFilter[] | undefined,
  filters2: DataTableFilter[] | undefined,
): boolean => {
  if (filters1 === filters2) {
    return true;
  }

  if (!filters1 || !filters2) {
    return false;
  }

  if (filters1.length !== filters2.length) {
    return false;
  }

  const createFilterKey = (filter: DataTableFilter) => {
    const sortedValues = [...filter.value].sort().join(',');
    return `${filter.id}:${sortedValues}`;
  };

  const set1 = new Set(filters1.map(createFilterKey));
  const set2 = new Set(filters2.map(createFilterKey));

  return set1.size === set2.size && [...set1].every(key => set2.has(key));
};
