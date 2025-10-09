import { addFiltersToFormData, transformDataTableFilters } from '../utils';
import { DataTableFilter } from '../types';

describe('course-list-search utils', () => {
  describe('addFiltersToFormData', () => {
    let formData: FormData;

    beforeEach(() => {
      formData = new FormData();
    });

    it('should add single filter with single value to FormData', () => {
      const filters = {
        language: ['en'],
      };

      addFiltersToFormData(formData, filters);

      expect(formData.get('language')).toBe('en');
    });

    it('should add multiple values for the same filter key', () => {
      const filters = {
        org: ['openedx', 'mit', 'harvard'],
      };

      addFiltersToFormData(formData, filters);

      const allOrgs = formData.getAll('org');
      expect(allOrgs).toEqual(['openedx', 'mit', 'harvard']);
    });

    it('should add multiple different filters', () => {
      const filters = {
        language: ['en', 'es'],
        org: ['openedx'],
        modes: ['audit', 'verified'],
      };

      addFiltersToFormData(formData, filters);

      expect(formData.getAll('language')).toEqual(['en', 'es']);
      expect(formData.getAll('org')).toEqual(['openedx']);
      expect(formData.getAll('modes')).toEqual(['audit', 'verified']);
    });

    it('should skip undefined values in array', () => {
      const filters = {
        language: ['en', undefined as any, 'es'],
      };

      addFiltersToFormData(formData, filters);

      expect(formData.getAll('language')).toEqual(['en', 'es']);
    });

    it('should handle non-array filter values', () => {
      const filters = {
        search: 'python' as any,
      };

      addFiltersToFormData(formData, filters);

      expect(formData.get('search')).toBe('python');
    });

    it('should skip empty string non-array values', () => {
      const filters = {
        search: '' as any,
        language: ['en'],
      };

      addFiltersToFormData(formData, filters);

      expect(formData.get('search')).toBeNull();
      expect(formData.get('language')).toBe('en');
    });

    it('should handle empty filters object', () => {
      const filters = {};

      addFiltersToFormData(formData, filters);

      // FormData should be empty
      expect(Array.from(formData.keys()).length).toBe(0);
    });

    it('should handle non-object filters parameter', () => {
      addFiltersToFormData(formData, 'invalid' as any);

      // FormData should remain empty
      expect(Array.from(formData.keys()).length).toBe(0);
    });

    it('should handle numeric string values correctly', () => {
      const filters = {
        rating: ['4', '5'],
      };

      addFiltersToFormData(formData, filters);

      expect(formData.getAll('rating')).toEqual(['4', '5']);
    });
  });

  describe('transformDataTableFilters', () => {
    it('should handle complex scenario with multiple filters and deduplication', () => {
      const filters: DataTableFilter[] = [
        { id: 'language', value: ['en', 'es'] },
        { id: 'org', value: 'openedx' },
        { id: 'language', value: ['fr', 'en'] }, // 'en' is duplicate
        { id: 'modes', value: ['audit', 'verified'] },
        { id: 'org', value: ['mit', 'openedx'] }, // 'openedx' is duplicate
      ];

      const result = transformDataTableFilters(filters);

      expect(result.language).toHaveLength(3);
      expect(result.language).toContain('en');
      expect(result.language).toContain('es');
      expect(result.language).toContain('fr');

      expect(result.org).toHaveLength(2);
      expect(result.org).toContain('openedx');
      expect(result.org).toContain('mit');

      expect(result.modes).toEqual(['audit', 'verified']);
    });
  });
});
