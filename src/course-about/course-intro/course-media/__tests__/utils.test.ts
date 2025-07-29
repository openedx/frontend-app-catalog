import { mockCourseAboutResponse } from '@src/__mocks__';
import { extractYouTubeVideoId, getMediaUris } from '../utils';

describe('Course Media Utils', () => {
  describe('extractYouTubeVideoId', () => {
    it('extracts video ID from standard YouTube URL', () => {
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=abc123')).toBe('abc123');
    });

    it('extracts video ID from YouTube URL with additional parameters', () => {
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=abc123&t=30s&feature=share')).toBe('abc123');
    });

    it('extracts video ID from YouTube URL with hash', () => {
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=abc123#t=30s')).toBe('abc123');
    });

    it('returns null for non-YouTube URL', () => {
      expect(extractYouTubeVideoId('https://example.com/video')).toBeNull();
    });

    it('returns null for invalid URL', () => {
      expect(extractYouTubeVideoId('not-a-url')).toBeNull();
    });

    it('returns null for empty URL', () => {
      expect(extractYouTubeVideoId('')).toBeNull();
    });
  });

  describe('getMediaUris', () => {
    const mockCourseData = {
      name: mockCourseAboutResponse.name,
      media: mockCourseAboutResponse.media,
    };

    it('returns correct URIs when both image and video are present', () => {
      const result = getMediaUris(mockCourseData);
      expect(result).toEqual({
        imageUrl: mockCourseAboutResponse.media.courseImage.uri,
        videoUrl: mockCourseAboutResponse.media.courseVideo?.uri,
      });
    });

    it('returns empty string for imageUrl when courseImage is missing', () => {
      const dataWithoutImage = {
        name: mockCourseAboutResponse.name,
        media: {
          courseImage: { uri: '' },
          courseVideo: { uri: mockCourseAboutResponse.media.courseVideo?.uri },
        },
      };
      const result = getMediaUris(dataWithoutImage);
      expect(result).toEqual({
        imageUrl: '',
        videoUrl: mockCourseAboutResponse.media.courseVideo?.uri,
      });
    });

    it('returns empty string for videoUrl when courseVideo is missing', () => {
      const dataWithoutVideo = {
        name: mockCourseAboutResponse.name,
        media: {
          courseImage: { uri: mockCourseAboutResponse.media.courseImage.uri },
        },
      };
      const result = getMediaUris(dataWithoutVideo);
      expect(result).toEqual({
        imageUrl: mockCourseAboutResponse.media.courseImage.uri,
        videoUrl: '',
      });
    });

    it('returns empty strings when media object is empty', () => {
      const emptyData = {
        name: mockCourseAboutResponse.name,
        media: {
          courseImage: { uri: '' },
        },
      };
      const result = getMediaUris(emptyData);
      expect(result).toEqual({
        imageUrl: '',
        videoUrl: '',
      });
    });

    it('handles null values in media object', () => {
      const dataWithNulls = {
        media: {
          courseImage: null,
          courseVideo: null,
        },
      };
      const result = getMediaUris(dataWithNulls as any);
      expect(result).toEqual({
        imageUrl: '',
        videoUrl: '',
      });
    });
  });
});
