import { extractYouTubeVideoId, getMediaUris } from '../utils';

describe('Course Media Utils', () => {
  describe('extractYouTubeVideoId', () => {
    it('extracts video ID from standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=abc123';
      expect(extractYouTubeVideoId(url)).toBe('abc123');
    });

    it('extracts video ID from YouTube URL with additional parameters', () => {
      const url = 'https://www.youtube.com/watch?v=abc123&t=30s&feature=share';
      expect(extractYouTubeVideoId(url)).toBe('abc123');
    });

    it('extracts video ID from YouTube URL with hash', () => {
      const url = 'https://www.youtube.com/watch?v=abc123#t=30s';
      expect(extractYouTubeVideoId(url)).toBe('abc123');
    });

    it('returns null for non-YouTube URL', () => {
      const url = 'https://example.com/video';
      expect(extractYouTubeVideoId(url)).toBeNull();
    });

    it('returns null for invalid URL', () => {
      const url = 'not-a-url';
      expect(extractYouTubeVideoId(url)).toBeNull();
    });

    it('returns null for empty URL', () => {
      expect(extractYouTubeVideoId('')).toBeNull();
    });
  });

  describe('getMediaUris', () => {
    const mockCourseData = {
      name: 'Test Course',
      media: {
        courseImage: { uri: '/test-image.jpg' },
        courseVideo: { uri: 'https://youtube.com/watch?v=test123' },
      },
    };

    it('returns correct URIs when both image and video are present', () => {
      const result = getMediaUris(mockCourseData);
      expect(result).toEqual({
        imageUrl: '/test-image.jpg',
        videoUrl: 'https://youtube.com/watch?v=test123',
      });
    });

    it('returns empty string for imageUrl when courseImage is missing', () => {
      const dataWithoutImage = {
        name: 'Test Course',
        media: {
          courseImage: { uri: '' },
          courseVideo: { uri: 'https://youtube.com/watch?v=test123' },
        },
      };
      const result = getMediaUris(dataWithoutImage);
      expect(result).toEqual({
        imageUrl: '',
        videoUrl: 'https://youtube.com/watch?v=test123',
      });
    });

    it('returns empty string for videoUrl when courseVideo is missing', () => {
      const dataWithoutVideo = {
        name: 'Test Course',
        media: {
          courseImage: { uri: '/test-image.jpg' },
        },
      };
      const result = getMediaUris(dataWithoutVideo);
      expect(result).toEqual({
        imageUrl: '/test-image.jpg',
        videoUrl: '',
      });
    });

    it('returns empty strings when media object is empty', () => {
      const emptyData = {
        name: 'Test Course',
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
