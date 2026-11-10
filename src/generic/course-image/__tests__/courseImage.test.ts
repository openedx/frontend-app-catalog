import type { SyntheticEvent } from 'react';
import { getSiteConfig } from '@openedx/frontend-base';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import { onImageLoadError, resolveImageUrl } from '..';

describe('course-image', () => {
  describe('resolveImageUrl', () => {
    it('falls back to the placeholder when there is no path', () => {
      expect(resolveImageUrl(undefined)).toBe(noCourseImg);
      expect(resolveImageUrl(null)).toBe(noCourseImg);
      expect(resolveImageUrl('')).toBe(noCourseImg);
    });

    it('prefixes the LMS base URL for a site-relative path', () => {
      const imagePath = '/asset/course.jpg';

      expect(resolveImageUrl(imagePath)).toBe(`${getSiteConfig().lmsBaseUrl}${imagePath}`);
    });

    it('leaves an already-absolute URL unchanged', () => {
      const absoluteUrl = 'https://cdn.example.com/course.jpg';

      expect(resolveImageUrl(absoluteUrl)).toBe(absoluteUrl);
      expect(resolveImageUrl('http://cdn.example.com/course.jpg')).toBe('http://cdn.example.com/course.jpg');
    });
  });

  describe('onImageLoadError', () => {
    const errorEvent = (image: HTMLImageElement) => ({
      currentTarget: image,
    } as unknown as SyntheticEvent<HTMLImageElement>);

    it('shows the placeholder once and does not retry on repeated errors', () => {
      const image = document.createElement('img');
      image.src = 'http://example.com/broken.jpg';
      const setSrc = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');

      onImageLoadError(errorEvent(image));
      onImageLoadError(errorEvent(image));
      onImageLoadError(errorEvent(image));

      // The browser resolves `img.src`, so the guard compares resolved values:
      // after the swap the src ends with the placeholder path, which stops the loop.
      expect(setSrc).toHaveBeenCalledTimes(1);
      expect(image.src.endsWith(noCourseImg)).toBe(true);
      setSrc.mockRestore();
    });

    it('leaves an image that already shows the placeholder untouched', () => {
      const image = document.createElement('img');
      image.src = noCourseImg;
      const setSrc = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');

      onImageLoadError(errorEvent(image));

      expect(setSrc).not.toHaveBeenCalled();
      setSrc.mockRestore();
    });
  });
});
