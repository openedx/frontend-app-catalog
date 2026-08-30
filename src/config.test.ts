import { getAppConfig } from '@openedx/frontend-base';

import { getCountConfig, getStringConfig } from './config';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAppConfig: jest.fn(),
}));

const mockedGetAppConfig = getAppConfig as jest.Mock;

const withAppConfig = (config: Record<string, unknown>) => {
  mockedGetAppConfig.mockReturnValue(config);
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('getStringConfig', () => {
  it('returns a configured string', () => {
    withAppConfig({ INFO_EMAIL: 'support@example.com' });

    expect(getStringConfig('INFO_EMAIL')).toBe('support@example.com');
  });

  it('falls back to an empty string when the key is absent', () => {
    withAppConfig({});

    expect(getStringConfig('INFO_EMAIL')).toBe('');
  });

  it('returns the given fallback when the key is absent', () => {
    withAppConfig({});

    expect(getStringConfig('INFO_EMAIL', 'noreply@example.com')).toBe('noreply@example.com');
  });

  it.each([
    ['null', null],
    ['a number', 9],
    ['a boolean', true],
  ])('falls back when the value is %s', (_label, value) => {
    withAppConfig({ INFO_EMAIL: value });

    expect(getStringConfig('INFO_EMAIL', 'noreply@example.com')).toBe('noreply@example.com');
  });
});

describe('getCountConfig', () => {
  it('returns a configured count', () => {
    withAppConfig({ HOMEPAGE_COURSE_MAX: 12 });

    expect(getCountConfig('HOMEPAGE_COURSE_MAX', 9)).toBe(12);
  });

  it('returns a count configured as a numeric string', () => {
    withAppConfig({ HOMEPAGE_COURSE_MAX: '12' });

    expect(getCountConfig('HOMEPAGE_COURSE_MAX', 9)).toBe(12);
  });

  it('falls back when the key is absent', () => {
    withAppConfig({});

    expect(getCountConfig('HOMEPAGE_COURSE_MAX', 9)).toBe(9);
  });

  it.each([
    ['null, as the LMS sends for an unset setting', null],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['a boolean', true],
    ['an object', {}],
    ['zero', 0],
    ['negative', -1],
    ['fractional', 1.5],
    ['a non-numeric string', 'twelve'],
    ['an empty string', ''],
    ['a fractional string', '1.5'],
    ['a zero string', '0'],
  ])('falls back when the value is %s', (_label, value) => {
    withAppConfig({ HOMEPAGE_COURSE_MAX: value });

    expect(getCountConfig('HOMEPAGE_COURSE_MAX', 9)).toBe(9);
  });
});
