import { CheckboxFilter } from '@openedx/paragon';
import { IntlShape } from '@edx/frontend-platform/i18n';
import capitalize from 'lodash.capitalize';

import type { CourseListSearchResponse, Aggregations } from '@src/data/course-list-search/types';
import type { TransformedCourseItem } from './types';
import messages from './messages';

/**
 * Transforms course list search results into a format suitable for DataTable display.
 */
export const transformResultsForTable = (results: CourseListSearchResponse['results']): TransformedCourseItem[] => results.map(item => ({
  id: item.id,
  famous_for: item.data.content.displayName,
  language: item.data.language,
  modes: item.data.modes,
  org: item.data.org,
  data: item.data,
  index: item.index,
  type: item.type,
}));

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
