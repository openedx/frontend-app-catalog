import { mockCourseAboutResponse } from '@src/__mocks__';
import { getSidebarDetails } from '../utils';
import { SIDEBAR_DETAIL_KEYS } from '../constants';
import messages from '../messages';

describe('getSidebarDetails', () => {
  const mockIntl = {
    formatMessage: jest.fn((message) => message.defaultMessage),
    formatDate: jest.fn(),
  } as any;

  beforeEach(() => {
    mockIntl.formatDate.mockClear();
  });

  const createCourseData = (overrides = {}) => ({
    ...mockCourseAboutResponse,
    ...overrides,
  });

  const getDetailByKey = (result, key) => result.find(detail => detail.key === key);

  beforeEach(() => jest.clearAllMocks());

  it('returns all sidebar details with correct structure', () => {
    const courseData = createCourseData({
      displayNumberWithDefault: 'CS101',
      effort: '5-10 hours per week',
      start: '2024-01-15T00:00:00Z',
      end: '2024-06-15T00:00:00Z',
      startDateIsStillDefault: false,
      requirements: 'Basic programming knowledge',
    });

    const result = getSidebarDetails(mockIntl, courseData);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({
      key: SIDEBAR_DETAIL_KEYS.COURSE_NUMBER,
      icon: expect.any(Function),
      label: messages.courseNumber.defaultMessage,
      value: courseData.displayNumberWithDefault,
      show: true,
    });
  });

  it('handles course number correctly', () => {
    const courseData = createCourseData({
      displayNumberWithDefault: 'MATH101',
    });

    const result = getSidebarDetails(mockIntl, courseData);
    const courseNumberDetail = getDetailByKey(result, SIDEBAR_DETAIL_KEYS.COURSE_NUMBER);

    expect(courseNumberDetail).toEqual({
      key: SIDEBAR_DETAIL_KEYS.COURSE_NUMBER,
      icon: expect.any(Function),
      label: messages.courseNumber.defaultMessage,
      value: courseData.displayNumberWithDefault,
      show: true,
    });
  });

  it('handles start date when startDateIsStillDefault is false', () => {
    const formattedDate = 'Jan 15, 2024';
    mockIntl.formatDate.mockReturnValue(formattedDate);

    const courseData = createCourseData({
      start: '2024-01-15T00:00:00Z',
      startDateIsStillDefault: false,
    });

    const result = getSidebarDetails(mockIntl, courseData);
    const startDateDetail = getDetailByKey(result, SIDEBAR_DETAIL_KEYS.START_DATE);

    expect(startDateDetail?.show).toBe(true);
    // formatDate will format according to locale, so we check it contains expected parts
    expect(startDateDetail?.value).toMatch(/Jan.*15.*2024/);
  });

  it('handles start date when startDateIsStillDefault is true', () => {
    const courseData = createCourseData({
      start: '2024-01-15T00:00:00Z',
      startDateIsStillDefault: true,
    });

    const result = getSidebarDetails(mockIntl, courseData);
    const startDateDetail = getDetailByKey(result, SIDEBAR_DETAIL_KEYS.START_DATE);

    expect(startDateDetail?.show).toBe(false);
  });

  it('uses advertisedStart when start is not available', () => {
    const formattedDate = 'Feb 1, 2024';
    mockIntl.formatDate.mockReturnValue(formattedDate);

    const courseData = createCourseData({
      start: null,
      advertisedStart: '2024-02-01T00:00:00Z',
      startDateIsStillDefault: false,
    });

    const result = getSidebarDetails(mockIntl, courseData);
    const startDateDetail = getDetailByKey(result, SIDEBAR_DETAIL_KEYS.START_DATE);

    expect(startDateDetail?.show).toBe(true);
    expect(startDateDetail?.value).toMatch(/Feb.*1.*2024/);
  });

  it('handles end date when provided', () => {
    const formattedDate = 'Jun 15, 2024';
    mockIntl.formatDate.mockReturnValue(formattedDate);

    const courseData = createCourseData({
      end: '2024-06-15T00:00:00Z',
    });

    const result = getSidebarDetails(mockIntl, courseData);
    const endDateDetail = getDetailByKey(result, SIDEBAR_DETAIL_KEYS.END_DATE);

    expect(endDateDetail?.show).toBe(true);
    expect(endDateDetail?.value).toMatch(/Jun.*15.*2024/);
  });

  it('handles end date when not provided', () => {
    const courseData = createCourseData({ end: null });

    const result = getSidebarDetails(mockIntl, courseData);
    const endDateDetail = getDetailByKey(result, SIDEBAR_DETAIL_KEYS.END_DATE);

    expect(endDateDetail?.show).toBe(false);
  });

  it('handles effort when provided', () => {
    const courseData = createCourseData({
      effort: '3-5 hours per week',
    });

    const result = getSidebarDetails(mockIntl, courseData);
    const effortDetail = getDetailByKey(result, SIDEBAR_DETAIL_KEYS.EFFORT);

    expect(effortDetail?.show).toBe(true);
    expect(effortDetail?.value).toBe(courseData.effort);
  });

  it('handles effort when not provided', () => {
    const courseData = createCourseData({ effort: null });

    const result = getSidebarDetails(mockIntl, courseData);
    const effortDetail = getDetailByKey(result, SIDEBAR_DETAIL_KEYS.EFFORT);

    expect(effortDetail?.show).toBe(false);
  });

  it('handles requirements when provided', () => {
    const courseData = createCourseData({
      requirements: 'Basic math knowledge',
    });

    const result = getSidebarDetails(mockIntl, courseData);
    const requirementsDetail = getDetailByKey(result, SIDEBAR_DETAIL_KEYS.REQUIREMENTS);

    expect(requirementsDetail?.show).toBe(true);
    expect(requirementsDetail?.value).toBe(courseData.requirements);
  });

  it('handles requirements when not provided', () => {
    const courseData = createCourseData({ requirements: null });

    const result = getSidebarDetails(mockIntl, courseData);
    const requirementsDetail = result.find(detail => detail.key === SIDEBAR_DETAIL_KEYS.REQUIREMENTS);

    expect(requirementsDetail?.show).toBe(false);
  });

  it('handles empty string requirements', () => {
    const courseData = createCourseData({ requirements: '' });

    const result = getSidebarDetails(mockIntl, courseData);
    const requirementsDetail = result.find(detail => detail.key === SIDEBAR_DETAIL_KEYS.REQUIREMENTS);

    expect(requirementsDetail?.show).toBe(false);
  });

  it('returns correct icons for each detail type', () => {
    const courseData = createCourseData();
    const result = getSidebarDetails(mockIntl, courseData);

    Object.values(SIDEBAR_DETAIL_KEYS).forEach((key) => {
      const detail = getDetailByKey(result, key);
      expect(detail?.icon).toBeDefined();
    });
  });

  it('handles edge case with all null values', () => {
    const courseData = createCourseData({
      displayNumberWithDefault: 'TEST101',
      effort: null,
      start: null,
      end: null,
      startDateIsStillDefault: true,
      requirements: null,
    });

    const result = getSidebarDetails(mockIntl, courseData);
    const get = (key: string) => getDetailByKey(result, key);

    expect(get(SIDEBAR_DETAIL_KEYS.COURSE_NUMBER)?.show).toBe(true);
    expect(get(SIDEBAR_DETAIL_KEYS.START_DATE)?.show).toBe(false);
    expect(get(SIDEBAR_DETAIL_KEYS.END_DATE)?.show).toBe(false);
    expect(get(SIDEBAR_DETAIL_KEYS.EFFORT)?.show).toBe(false);
    expect(get(SIDEBAR_DETAIL_KEYS.REQUIREMENTS)?.show).toBe(false);
  });

  it('handles empty string dates', () => {
    const formattedDate = 'Invalid Date';
    mockIntl.formatDate.mockReturnValue(formattedDate);

    const courseData = createCourseData({
      start: '',
      end: '',
      startDateIsStillDefault: false,
    });

    const result = getSidebarDetails(mockIntl, courseData);
    const get = (key: string) => getDetailByKey(result, key);

    expect(get(SIDEBAR_DETAIL_KEYS.START_DATE)?.show).toBe(true);
    expect(get(SIDEBAR_DETAIL_KEYS.START_DATE)?.value).toBe('Invalid Date');
    expect(get(SIDEBAR_DETAIL_KEYS.END_DATE)?.show).toBe(false);
  });

  it('handles undefined values gracefully', () => {
    const courseData = createCourseData({
      effort: undefined,
      requirements: undefined,
    });

    const result = getSidebarDetails(mockIntl, courseData);
    const get = (key: string) => getDetailByKey(result, key);

    expect(get(SIDEBAR_DETAIL_KEYS.EFFORT)?.show).toBe(false);
    expect(get(SIDEBAR_DETAIL_KEYS.REQUIREMENTS)?.show).toBe(false);
  });
});
