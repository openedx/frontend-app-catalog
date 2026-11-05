import { isValidCssColor } from '../utils';

describe('isValidCssColor', () => {
  let cssDescriptor: PropertyDescriptor | undefined;
  let documentDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    cssDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'CSS');
    documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  });

  afterEach(() => {
    if (cssDescriptor) {
      Object.defineProperty(globalThis, 'CSS', cssDescriptor);
    } else {
      delete (globalThis as { CSS?: unknown }).CSS;
    }
    if (documentDescriptor) {
      Object.defineProperty(globalThis, 'document', documentDescriptor);
    } else {
      delete (globalThis as { document?: unknown }).document;
    }
  });

  it('returns false when document is unavailable', () => {
    let documentWasChecked = false;

    Object.defineProperty(globalThis, 'CSS', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      get: () => {
        documentWasChecked = true;
        return undefined;
      },
    });

    expect(isValidCssColor('#123456')).toBe(false);
    expect(documentWasChecked).toBe(true);
  });

  it('uses CSS.supports when available and accepts valid colors', () => {
    const supports = jest.fn().mockReturnValue(true);
    Object.defineProperty(globalThis, 'CSS', {
      configurable: true,
      value: { supports },
    });

    expect(isValidCssColor('#123456')).toBe(true);
    expect(isValidCssColor('white')).toBe(true);
    expect(supports).toHaveBeenCalledWith('color', '#123456');
    expect(supports).toHaveBeenCalledWith('color', 'white');
  });

  it('uses CSS.supports when available and rejects invalid colors', () => {
    const supports = jest.fn().mockReturnValue(false);
    Object.defineProperty(globalThis, 'CSS', {
      configurable: true,
      value: { supports },
    });

    expect(isValidCssColor('not-a-color')).toBe(false);
    expect(supports).toHaveBeenCalledWith('color', 'not-a-color');
  });

  it('falls back safely when CSS.supports throws', () => {
    const supports = jest.fn().mockImplementation(() => {
      throw new Error('unsupported');
    });
    Object.defineProperty(globalThis, 'CSS', {
      configurable: true,
      value: { supports },
    });

    expect(isValidCssColor('#123456')).toBe(false);
  });
});
