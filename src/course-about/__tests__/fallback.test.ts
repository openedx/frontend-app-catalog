import { mockCourseAboutResponse } from '@src/__mocks__';

import { COURSE_ABOUT_FALLBACK, expandCourseAboutData } from '../fallback';
import type { CourseAboutInput } from '../types';

const CORE_ONLY: CourseAboutInput = {
  id: 'course-1',
  name: 'Course One',
  displayOrgWithDefault: 'Org',
  displayNumberWithDefault: 'C1',
  shortDescription: 'A short description',
  overview: '<p>Overview</p>',
};

describe('expandCourseAboutData', () => {
  it('returns a record with every field the v1 slots read', () => {
    const expanded = expandCourseAboutData(CORE_ONLY);

    expect(Object.keys(expanded).sort()).toEqual(
      [...new Set([...Object.keys(COURSE_ABOUT_FALLBACK), ...Object.keys(CORE_ONLY)])].sort(),
    );
  });

  it('keeps source values and fills only what the source omitted', () => {
    const expanded = expandCourseAboutData({ ...CORE_ONLY, effort: '3 hours per week', coursePrice: 'Free' });

    expect(expanded.effort).toBe('3 hours per week');
    expect(expanded.coursePrice).toBe('Free');
    expect(expanded.start).toBe('');
    expect(expanded.language).toBe('');
    expect(expanded.canEnroll).toBe(false);
  });

  it('tops up nested media so slot consumers always get a complete shape', () => {
    const expanded = expandCourseAboutData({
      ...CORE_ONLY,
      media: { courseImage: { uri: '/asset/course.jpg' } },
    });

    expect(expanded.media).toEqual({
      courseImage: { uri: '/asset/course.jpg' },
      courseVideo: { uri: null },
      image: { raw: '', small: '', large: '' },
    });
  });

  it('leaves a fetched record untouched', () => {
    const expanded = expandCourseAboutData(mockCourseAboutResponse);

    expect(expanded.name).toBe(mockCourseAboutResponse.name);
    expect(expanded.coursePrice).toBe(mockCourseAboutResponse.coursePrice);
    expect(expanded.displayNumberWithDefault).toBe(mockCourseAboutResponse.displayNumberWithDefault);
    expect(expanded.media).toEqual(mockCourseAboutResponse.media);
  });

  it('carries no learner-facing copy in its neutral defaults', () => {
    // Copy that used to live in the embedding host must not come back here.
    [
      'MIT OpenLearning',
      '1234',
      'Free',
      'Mar 3, 2027',
      '2027-03-03',
      '4-6 hours per week',
      'all-rights-reserved',
      'English',
    ].forEach((copy) => {
      expect(JSON.stringify(COURSE_ABOUT_FALLBACK)).not.toContain(copy);
    });
  });
});
