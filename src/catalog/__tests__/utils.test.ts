import { CheckboxFilter } from '@openedx/paragon';
import { IntlShape, createIntl } from '@edx/frontend-platform/i18n';

import { mockCourseListSearchResponse } from '@src/__mocks__';
import { transformResultsForTable, transformAggregationsToFilterChoices } from '../utils';
import messages from '../messages';

describe('utils', () => {
  describe('transformResultsForTable', () => {
    it('should transform course results into table format', () => {
      const results = mockCourseListSearchResponse.results.map(result => ({
        ...result,
        title: result.data.content.displayName,
      }));
      const transformed = transformResultsForTable(results);
      const mockCourse = mockCourseListSearchResponse.results[0];

      expect(transformed).toHaveLength(mockCourseListSearchResponse.results.length);
      expect(transformed[0]).toEqual({
        id: mockCourse.id,
        famous_for: mockCourse.data.content.displayName,
        language: mockCourse.data.language,
        modes: mockCourse.data.modes,
        org: mockCourse.data.org,
        data: mockCourse.data,
        index: mockCourse.index,
        type: mockCourse.type,
      });
    });

    it('should map all required fields correctly', () => {
      const results = mockCourseListSearchResponse.results.map(result => ({
        ...result,
        title: result.data.content.displayName,
      }));
      const transformed = transformResultsForTable(results);

      transformed.forEach((item, index) => {
        expect(item.id).toBe(results[index].id);
        expect(item.famous_for).toBe(results[index].data.content.displayName);
        expect(item.language).toBe(results[index].data.language);
        expect(item.modes).toBe(results[index].data.modes);
        expect(item.org).toBe(results[index].data.org);
        expect(item.data).toBe(results[index].data);
        expect(item.index).toBe(results[index].index);
        expect(item.type).toBe(results[index].type);
      });
    });

    it('should handle empty results array', () => {
      const transformed = transformResultsForTable([]);
      expect(transformed).toEqual([]);
    });

    it('should handle single course result', () => {
      const mockCourse = mockCourseListSearchResponse.results[0];
      const singleResult = [{
        ...mockCourse,
        title: mockCourse.data.content.displayName,
      }];
      const transformed = transformResultsForTable(singleResult);

      expect(transformed).toHaveLength(1);
      expect(transformed[0].id).toBe(mockCourse.id);
      expect(transformed[0].famous_for).toBe(mockCourse.data.content.displayName);
    });
  });

  describe('transformAggregationsToFilterChoices', () => {
    const intl = createIntl({
      locale: 'en',
      messages: {
        organizations: messages.organizations,
        languages: messages.languages,
        courseTypes: messages.courseTypes,
      },
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return empty array when aggregations are undefined', () => {
      const result = transformAggregationsToFilterChoices(undefined, intl);
      expect(result).toEqual([]);
    });

    it('should transform aggregations into filter choices', () => {
      const { aggs } = mockCourseListSearchResponse;
      const result = transformAggregationsToFilterChoices(aggs, intl);

      expect(result).toHaveLength(Object.keys(aggs).length); // language, modes, org
      expect(result.every(column => column.Filter === CheckboxFilter)).toBe(true);
      expect(result.every(column => column.filter === 'includesValue')).toBe(true);
    });

    it('should set correct headers using intl messages', () => {
      const { aggs } = mockCourseListSearchResponse;
      const result = transformAggregationsToFilterChoices(aggs, intl);

      const headersMap = result.reduce((acc, col) => {
        acc[col.accessor] = col.Header;
        return acc;
      }, {});

      expect(headersMap).toEqual({
        language: messages.languages.defaultMessage,
        modes: messages.courseTypes.defaultMessage,
        org: messages.organizations.defaultMessage,
      });
    });

    it('should create filter choices with correct structure', () => {
      const { aggs } = mockCourseListSearchResponse;
      const result = transformAggregationsToFilterChoices(aggs, intl);

      const languageColumn = result.find(col => col.accessor === 'language');

      expect(languageColumn?.filterChoices).toEqual([
        {
          name: 'English',
          number: 3,
          value: 'en',
        },
      ]);
    });

    it('should capitalize non-language filter choice names', () => {
      const { aggs } = mockCourseListSearchResponse;
      const result = transformAggregationsToFilterChoices(aggs, intl);

      const modesColumn = result.find(col => col.accessor === 'modes');

      expect(modesColumn?.filterChoices).toEqual([
        {
          name: 'Audit',
          number: 3,
          value: 'audit',
        },
      ]);
    });

    it('should handle multiple organization terms', () => {
      const { aggs } = mockCourseListSearchResponse;
      const result = transformAggregationsToFilterChoices(aggs, intl);

      const orgColumn = result.find(col => col.accessor === 'org');

      expect(orgColumn?.filterChoices).toHaveLength(2);
      expect(orgColumn?.filterChoices).toContainEqual({
        name: 'Dev',
        number: 1,
        value: 'dev',
      });
      expect(orgColumn?.filterChoices).toContainEqual({
        name: 'Openedx',
        number: 1,
        value: 'openedx',
      });
    });

    it('should use locale for language display names', () => {
      const aggs = {
        language: {
          terms: { es: 2, fr: 1 },
          total: 3,
          other: 0,
        },
      };

      const result = transformAggregationsToFilterChoices(aggs, intl);
      const languageColumn = result.find(col => col.accessor === 'language');

      expect(languageColumn?.filterChoices).toHaveLength(2);

      const expectedChoices = [
        { value: 'es', name: 'Spanish' },
        { value: 'fr', name: 'French' },
      ];

      expectedChoices.forEach(expected => {
        expect(languageColumn?.filterChoices).toContainEqual(
          expect.objectContaining(expected),
        );
      });
    });

    it('should handle empty terms object', () => {
      const aggs = {
        language: {
          terms: {},
          total: 0,
          other: 0,
        },
      };

      const result = transformAggregationsToFilterChoices(aggs, intl);

      expect(result).toHaveLength(1);
      expect(result[0].filterChoices).toEqual([]);
    });

    it('should handle missing terms property', () => {
      const aggs = {
        language: {
          total: 0,
          other: 0,
        } as any,
      };

      const result = transformAggregationsToFilterChoices(aggs, intl);

      expect(result).toHaveLength(1);
      expect(result[0].filterChoices).toEqual([]);
    });

    it('should use capitalized key as fallback header for unknown aggregation types', () => {
      const aggs = {
        customField: {
          terms: {
            value1: 5,
          },
          total: 5,
          other: 0,
        },
      };

      const result = transformAggregationsToFilterChoices(aggs, intl);

      expect(result[0].Header).toBe('Customfield');
      expect(result[0].accessor).toBe('customField');
    });

    it('should fallback to capitalize for invalid language codes', () => {
      const aggs = {
        language: {
          terms: {
            invalidcode: 1,
          },
          total: 1,
          other: 0,
        },
      };

      const result = transformAggregationsToFilterChoices(aggs, intl);
      const languageColumn = result.find(col => col.accessor === 'language');

      expect(languageColumn?.filterChoices?.[0].name).toBe('Invalidcode');
    });

    it('should use different locale when provided', () => {
      const spanishIntl: IntlShape = {
        ...intl,
        locale: 'es',
      };

      const aggs = {
        language: {
          terms: { en: 3 },
          total: 3,
          other: 0,
        },
      };

      const result = transformAggregationsToFilterChoices(aggs, spanishIntl);
      const languageColumn = result.find(col => col.accessor === 'language');

      expect(languageColumn?.filterChoices?.[0]).toMatchObject({
        value: 'en',
        name: 'inglés',
      });
    });
  });
});
