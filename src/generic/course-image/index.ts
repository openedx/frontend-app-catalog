import type { SyntheticEvent } from 'react';
import { getSiteConfig } from '@openedx/frontend-base';

import noCourseImg from '@src/assets/images/no-course-image.svg';

/**
 * The placeholder every image region falls back to. Consumers pass it to
 * `Card.ImageCap`'s `fallbackSrc`, because Paragon would otherwise swap in
 * its own generic data-URI default for a card whose load fails.
 */
export const IMAGE_PLACEHOLDER = noCourseImg;

/**
 * Resolves a site-relative image path to the URL the browser should load.
 *
 * - An already-absolute http(s) URL is returned unchanged.
 * - A missing path resolves to the placeholder, so an image region with no
 *   path renders the same fallback as one whose load failed instead of an
 *   empty frame.
 */
export const resolveImageUrl = (path?: string | null): string => {
  if (!path) {
    return noCourseImg;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${getSiteConfig().lmsBaseUrl}${path}`;
};

/**
 * The single image-error guard: show the placeholder once and never loop.
 *
 * Compares the resolved `src`, because the browser resolves `img.src` to an
 * absolute URL that can never equal the relative placeholder path this file
 * imports. Comparing the raw attribute also works, but breaks as soon as a
 * caller passes an already-absolute placeholder.
 */
export const onImageLoadError = (event: SyntheticEvent<HTMLImageElement>) => {
  const { currentTarget } = event;

  if (!currentTarget.src.endsWith(noCourseImg)) {
    currentTarget.src = noCourseImg;
  }
};
