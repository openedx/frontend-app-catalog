import { resolveImageUrl } from '@src/generic/course-image';

/** LMS asset paths authors embed in overview HTML; other sources are left to the browser. */
const LMS_IMAGE_PATH = /^\/(static\/images\/|asset)/;

const toRenderableSrc = (src: string) => (src === '' || LMS_IMAGE_PATH.test(src) ? resolveImageUrl(src) : src);

/**
 * Processes overview content to resolve LMS image paths
 * @param overview - The overview HTML content
 * @returns Processed overview content with resolved image paths
 */
export const processOverviewContent = (overview: string): string => {
  if (!overview) {
    return overview;
  }

  return overview.replace(/\ssrc="([^"]*)"/g, (_, src: string) => ` src="${toRenderableSrc(src)}"`);
};
