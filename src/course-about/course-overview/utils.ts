import { resolveImageUrl } from '@src/generic/course-image';

/**
 * Processes overview content to replace image paths
 * @param overview - The overview HTML content
 * @returns Processed overview content with updated image paths
 */
export const processOverviewContent = (overview: string): string => {
  if (!overview) {
    return overview;
  }

  return overview.replace(/\ssrc="([^"]*)"/g, (_, src: string) => ` src="${resolveImageUrl(src)}"`);
};
