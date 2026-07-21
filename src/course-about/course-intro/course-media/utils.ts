import type { CourseMediaTypes, ExtractYouTubeVideoIdTypes } from './types';

/**
 * Extracts the YouTube video ID from a given URL.
 */
export const extractYouTubeVideoId: ExtractYouTubeVideoIdTypes = (url) => {
  const match = /[?&]v=([^&#]+)/.exec(url);
  return match ? match[1] : null;
};

/**
 * Returns media URIs (image and video) from course about data.
 */
export const getMediaUris = (courseAboutData: CourseMediaTypes['courseAboutData']) => ({
  imageUrl: courseAboutData.media.courseImage?.uri ?? '',
  videoUrl: courseAboutData.media.courseVideo?.uri ?? '',
});
