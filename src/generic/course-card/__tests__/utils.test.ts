import { getConfig } from '@edx/frontend-platform';

import { mockCourseResponse } from '@src/__mocks__';
import { DATE_FORMAT_OPTIONS } from '@src/constants';
import { getFullImageUrl, getStartDateDisplay } from '../utils';
import type { Course } from '../types';

describe('course-card utils', () => {
  describe('getFullImageUrl', () => {
    it('returns empty string when path is undefined', () => {
      expect(getFullImageUrl(undefined)).toBe('');
    });

    it('returns empty string when path is null', () => {
      expect(getFullImageUrl(null as any)).toBe('');
    });

    it('returns empty string when path is empty string', () => {
      expect(getFullImageUrl('')).toBe('');
    });

    it('constructs full URL when path is provided', () => {
      const imagePath = mockCourseResponse.data.imageUrl;
      const expectedUrl = `${getConfig().LMS_BASE_URL}${imagePath}`;

      expect(getFullImageUrl(imagePath)).toBe(expectedUrl);
    });
  });

  describe('getStartDateDisplay', () => {
    const mockIntl = {
      formatDate: jest.fn(),
    } as any;

    beforeEach(() => {
      mockIntl.formatDate.mockClear();
    });

    it('returns advertisedStart when available', () => {
      const course: Course = {
        ...mockCourseResponse,
        data: {
          ...mockCourseResponse.data,
          advertisedStart: 'Spring 2024',
        },
      };

      const result = getStartDateDisplay(course, mockIntl);

      expect(result).toBe('Spring 2024');
      expect(mockIntl.formatDate).not.toHaveBeenCalled();
    });

    it('returns formatted start date when advertisedStart is not available', () => {
      const course: Course = {
        ...mockCourseResponse,
        data: {
          ...mockCourseResponse.data,
          advertisedStart: undefined,
          start: '2024-04-01T00:00:00Z',
        },
      };

      const formattedDate = 'Apr 1, 2024';
      mockIntl.formatDate.mockReturnValue(formattedDate);

      const result = getStartDateDisplay(course, mockIntl);

      expect(result).toBe(formattedDate);
      expect(mockIntl.formatDate).toHaveBeenCalledWith(
        new Date('2024-04-01T00:00:00Z'),
        DATE_FORMAT_OPTIONS,
      );
    });

    it('returns formatted start date when advertisedStart is empty string', () => {
      const course: Course = {
        ...mockCourseResponse,
        data: {
          ...mockCourseResponse.data,
          advertisedStart: '',
          start: '2024-06-15T10:30:00Z',
        },
      };

      const formattedDate = 'Jun 15, 2024';
      mockIntl.formatDate.mockReturnValue(formattedDate);

      const result = getStartDateDisplay(course, mockIntl);

      expect(result).toBe(formattedDate);
      expect(mockIntl.formatDate).toHaveBeenCalledWith(
        new Date('2024-06-15T10:30:00Z'),
        DATE_FORMAT_OPTIONS,
      );
    });

    it('returns empty string when both advertisedStart and start are not available', () => {
      const course: Course = {
        ...mockCourseResponse,
        data: {
          ...mockCourseResponse.data,
          advertisedStart: undefined,
          start: '',
        },
      };

      const result = getStartDateDisplay(course, mockIntl);

      expect(result).toBe('');
      expect(mockIntl.formatDate).not.toHaveBeenCalled();
    });

    it('returns empty string when course is undefined', () => {
      const result = getStartDateDisplay(undefined as unknown as Course, mockIntl);

      expect(result).toBe('');
      expect(mockIntl.formatDate).not.toHaveBeenCalled();
    });

    it('returns empty string when course.data is undefined', () => {
      const course = {
        ...mockCourseResponse,
        data: undefined,
      } as any;

      const result = getStartDateDisplay(course, mockIntl);

      expect(result).toBe('');
      expect(mockIntl.formatDate).not.toHaveBeenCalled();
    });

    it('prioritizes advertisedStart over start date', () => {
      const course: Course = {
        ...mockCourseResponse,
        data: {
          ...mockCourseResponse.data,
          advertisedStart: 'Fall 2024',
          start: '2024-09-01T00:00:00Z',
        },
      };

      const result = getStartDateDisplay(course, mockIntl);

      expect(result).toBe('Fall 2024');
      expect(mockIntl.formatDate).not.toHaveBeenCalled();
    });
  });
});
